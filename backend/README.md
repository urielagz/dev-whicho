# Dev Whicho — Backend

API REST modular en **Node.js + Express + TypeScript** sobre **PostgreSQL**,
con autenticación **JWT**, autorización por roles, archivos en
**Cloudinary**, correo con **Resend** y chat en tiempo real con **Socket.IO**.

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior

## Instalación

```bash
npm install
cp .env.example .env
psql -U <usuario> -d <base> -f database/database.sql   # idempotente
npm run dev
```

El servidor imprime `Dev Whicho ejecutándose en puerto 7000`. El mismo
puerto sirve la API REST y el chat (Socket.IO).

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Desarrollo con recarga automática |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run typecheck` | Revisa tipos sin compilar |
| `npm run probar:correo` | Envía un correo de prueba a `ADMIN_EMAIL` |

## Variables de entorno

Todas se leen **solo** en `src/config/env.ts`; el resto del código importa
`env` desde ahí. La lista completa con valores de ejemplo está en
`.env.example`. Las principales:

| Variable | Uso |
|---|---|
| `PORT` | Puerto HTTP (7000 por defecto) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Firma y duración del token |
| `DATABASE_URL` o `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` | PostgreSQL |
| `CORS_ORIGIN` | Orígenes permitidos (coma), `*` por defecto |
| `RESEND_API_KEY`, `MAIL_FROM`, `ADMIN_EMAIL` | Correo |
| `CLOUDINARY_*`, `CLOUDINARY_FOLDER` | Subida de archivos |

## Estructura

Organizado por **módulos de dominio**: todo lo de una funcionalidad vive junto.

```
src/
├── server.ts              arranque HTTP + Socket.IO, cierre ordenado
├── app.ts                 helmet, CORS, JSON, /health, rutas, errores
├── routes.ts              registro central prefijo -> router de cada módulo
├── config/                env (única lectura de process.env), BD, Cloudinary, correo
├── shared/
│   ├── http/              HttpError y validar() con zod
│   ├── middlewares/       auth JWT, roles, límites de intentos, errores
│   ├── upload/            configuración de multer
│   └── utils/             JWT, tokens, contraseñas
├── types/express.d.ts     tipa req.usuario
├── modules/<modulo>/
│   ├── <x>.routes.ts      URL + middlewares + validación
│   ├── <x>.controller.ts  traduce HTTP <-> servicio
│   ├── <x>.service.ts     reglas de negocio (auth, materias)
│   ├── <x>.schemas.ts     esquemas zod de entrada
│   ├── <x>.repository.ts  SQL parametrizado (instancia única por defecto)
│   └── <x>.model.ts       forma de la entidad
└── scripts/               utilidades manuales (probar-correo)
```

Sin `RESEND_API_KEY`, en desarrollo los correos se imprimen en consola en
lugar de enviarse (antes el servidor no arrancaba).

## Módulos y prefijos

| Prefijo | Módulo |
|---|---|
| `/usuarios`, `/login`, `/docentes` | Cuentas, sesión, solicitud y aprobación de docentes |
| `/anuncios`, `/asesorias` | Avisos generales y asesorías |
| `/materias`, `/temas`, `/recursos` | Contenido académico (`GET /materias/inscritas` para el alumno) |
| `/actividades`, `/examenes`, `/calificaciones`, `/progreso` | Evaluación |
| `/publicaciones`, `/comentarios` | Comunidad por materia |
| `/dashboard` | Notificaciones y calendario del alumno |
| `/chats` | Chat público y por materia |
| `/health` | Estado del servicio |

Todas las respuestas siguen el formato `{ ok: boolean, mensaje?, data? }`,
incluidos los 404 y los errores no controlados.

## Pruebas manuales

Importa `postman/DevWhicho.postman_collection.json` y
`postman/DevWhicho.postman_environment.json` y ejecuta las carpetas en orden.
