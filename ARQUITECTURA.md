# Arquitectura de Dev Whicho

## Vista general

```
 Navegador ── SPA React (docs/ en GitHub Pages, código en frontend/)
   │  lib/api.ts: fetch + JWT (Authorization: Bearer)    socket.io-client (auth.token)
   ▼                                                      ▼
 ┌──────────────────────────── backend (Render) ─────────────────────────────┐
 │ server.ts ── http.Server ──┬── app.ts (Express 5)                         │
 │                            └── modules/chat/chat.socket.ts (rooms)        │
 │                                                                           │
 │ app.ts: helmet → cors → json → /health → routes.ts → 404 → errores        │
 │                                                                           │
 │ <modulo>.routes  →  auth / roles / rate limit / multer / validar(zod)     │
 │      → <modulo>.controller  →  <modulo>.service  →  <modulo>.repository   │
 │                                                     → pg Pool → PostgreSQL│
 │                       ↘ Cloudinary (archivos)   ↘ Resend (correo)         │
 └───────────────────────────────────────────────────────────────────────────┘
```

## Frontend (`frontend/`)

React 18 + TypeScript + Vite. Sustituye a las páginas HTML/JS sueltas que
manipulaban el DOM a mano (≈3.000 líneas con el chat y el perfil copiados
entre `panel.js` y `alumno.js`, y el panel docente metido en un `<iframe>`).

```
src/
├── main.tsx               proveedores: React Query, avisos (toasts), sesión, router
├── app/router.tsx         todas las rutas y qué rol puede entrar a cada una
├── config.ts              URL del backend (VITE_API_URL o detección localhost/Render)
├── types.ts               tipos de dominio que devuelve la API
├── auth/                  sesión en localStorage, AuthContext, RutaProtegida
├── lib/
│   ├── api.ts             cliente HTTP único: token, JSON/FormData, ApiError, 401 → cierra sesión
│   ├── useMutacion.ts     mutación + toast de error + refresco de la caché
│   └── formato.ts         fechas, tamaños, tipos de archivo
├── components/            Modal, Toasts, estados (cargando/vacío/error), PanelLayout
├── features/
│   ├── auth/              login, registro, recuperar contraseña, solicitud docente
│   ├── academico/         API + claves de caché compartidas por docente y alumno
│   ├── docente/           gestor de materias, temas, modales de edición, calificar
│   ├── alumno/            dashboard y "biblioteca" (estante → índice → categoría → página)
│   ├── chat/              chat compartido (Socket.IO + polling de respaldo)
│   ├── perfil/            perfil compartido (+ progreso del alumno)
│   └── admin/             solicitudes de docentes
└── styles/                tokens (paleta única) + una hoja por área
```

Decisiones:

| Decisión | Por qué |
|---|---|
| **Rutas reales** (`#/alumno/materias/10/actividades/500`) | Antes la navegación del alumno era una pila en memoria: no había URL, el botón atrás del navegador no funcionaba y no se podía compartir un enlace. Hash router porque GitHub Pages no reescribe rutas de SPA. |
| **TanStack Query** para datos del servidor | Caché, reintentos y estados de carga/error uniformes; tras cada cambio se invalidan las claves afectadas en vez de recargar a mano. El polling del chat solo corre mientras el chat está visible. |
| **Un solo cliente HTTP** (`lib/api.ts`) | Se repetía el mismo `fetch` + token + manejo de error en ~60 sitios. |
| **Toasts** en lugar de `alert()` | No bloquean la página. |
| **Build a `docs/`** | GitHub Pages sigue sirviendo la misma carpeta; no hay que cambiar su configuración. |

## Backend (`backend/`)

### Capas

| Capa | Responsabilidad | No debe |
|---|---|---|
| `*.routes.ts` | URL, verbo, auth/roles, límites, multer, `validar(esquema)` | Contener lógica |
| `*.schemas.ts` | Validar y normalizar la entrada (zod) | Consultar la BD |
| `*.controller.ts` | Leer `req`, llamar al servicio, responder | Escribir SQL ni reglas de negocio |
| `*.service.ts` | Reglas de negocio; lanza `HttpError` | Conocer `req`/`res` |
| `*.repository.ts` | SQL parametrizado; instancia única por defecto | Conocer HTTP |
| `config/` | Todo lo que depende del entorno | Tener valores sueltos fuera de `env.ts` |

### Cambios de esta reestructuración

**Organización**
- De carpetas por tipo (`controllers/`, `routes/`, `repositories/`, `models/`)
  a **módulos por dominio** (`modules/materias/`, `modules/chat/`, …). Rutas
  HTTP y prefijos sin cambios.
- Repositorios con un único estilo (instancia por defecto); se eliminó el
  contenedor `repos` y los modelos sin uso (`Estudiante`, `Docente`, `Horario`).

**Express 5, errores y validación**
- Express 5 reenvía solo las promesas rechazadas al manejador de errores: se
  borró el parche `asyncErrors.ts`.
- `HttpError` (400/401/403/404/409): servicios y middlewares lanzan y el
  manejador global responde siempre `{ ok:false, mensaje }`. También trata
  `ZodError`, errores de multer, JSON roto y duplicados de PostgreSQL (409).
- `validar({ body, params })` con zod en auth, usuarios y materias.
- `req.usuario` tipado (`src/types/express.d.ts`).

**Capa de servicios** (implementación de referencia)
- `auth.service.ts`: login, registro, recuperación y cambio de contraseña.
  Había dos endpoints de login (`/login` y `/usuarios/login`) con respuestas
  distintas; ahora comparten código y respuesta.
- `materia.service.ts`: el controlador pasó de 690 líneas con try/catch a
  solo HTTP.

**Seguridad**
- `helmet`, límite de tamaño del JSON y `trust proxy` (Render).
- Límite de intentos en login, registro, recuperación de contraseña y
  solicitud de docente (`express-rate-limit`).
- `POST/DELETE /anuncios` y `/asesorias` **no tenían autenticación**; ahora
  requieren docente o admin.
- El login ya no dice si el correo existe; la recuperación de contraseña
  responde igual exista o no la cuenta.
- Contraseña mínima de 6 caracteres en registro y restablecimiento.
- Multer 1.x (vulnerable) → 2.x.

**Nuevo endpoint**
- `GET /materias/inscritas` (alumno). El frontend antes pedía todas las
  materias y luego hacía **una petición por materia** para averiguar si el
  alumno estaba inscrito.

**Desarrollo local**
- Sin `RESEND_API_KEY` el servidor no arrancaba (`new Resend()` lanzaba al
  importarse). Ahora en desarrollo los correos se imprimen en consola.

## Siguientes pasos recomendados

1. **Extender el patrón servicio + esquema** a los demás módulos, empezando
   por `actividades` (≈580 líneas) y `publicaciones`. Las rutas que no se
   migraron siguen funcionando igual (Express 5 ya atrapa sus errores).
2. **Tests**: Vitest + Supertest en el backend (login, inscripción,
   entregas) y Vitest + Testing Library en el frontend.
3. **Migraciones versionadas** (node-pg-migrate) en lugar de un único `database.sql`.
4. **Tokens de recuperación en BD**: hoy viven en memoria y se pierden al reiniciar.
5. **`strict: true`** en el `tsconfig` del backend (el frontend ya es estricto).
6. **GitHub Actions** que compile `frontend/` y publique en Pages, para no
   tener que hacer commit de `docs/`.
