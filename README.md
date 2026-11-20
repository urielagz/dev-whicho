# Dev Whicho

Plataforma educativa: materias, temas, recursos, actividades, exámenes,
calificaciones, comunidad por materia y chat en tiempo real, con roles
**alumno**, **docente** y **admin**.

```
dev-whicho/
├── frontend/         SPA en React 18 + TypeScript + Vite (código fuente)
├── docs/             build del frontend (lo publica GitHub Pages; no editar a mano)
├── backend/          API REST + Socket.IO (Node, Express 5, TypeScript, PostgreSQL)
│   ├── src/          código por módulos (ver backend/README.md)
│   ├── database/     esquema SQL completo (database.sql)
│   ├── postman/      colección y environment de pruebas
│   └── .env.example  variables de entorno
├── ARQUITECTURA.md   cómo está organizado y por qué
└── render.yaml       despliegue del backend + PostgreSQL en Render
```

## Arranque rápido (local)

```bash
# Backend  ->  http://localhost:7000  (GET /health para verificar)
cd backend
cp .env.example .env          # ajusta la BD y las claves
npm install
psql -U postgres -d dev_whicho -f database/database.sql
npm run dev

# Frontend ->  http://localhost:5173
cd frontend
npm install
npm run dev
```

En `localhost` el frontend apunta solo a `http://localhost:7000`; para otro
backend define `VITE_API_URL` (ver `frontend/.env.example`).

## Despliegue

- **Backend + BD:** Render, usando `render.yaml` (Blueprint).
- **Frontend:** `cd frontend && npm run build` escribe el sitio en `docs/`;
  haz commit de `docs/` y GitHub Pages lo publica (rama principal, carpeta `/docs`).
  Las rutas usan `#/` (p. ej. `.../#/alumno/materias/3`), así que funcionan
  al recargar sin configurar nada en Pages.

Más detalle en [`backend/README.md`](backend/README.md) y [`ARQUITECTURA.md`](ARQUITECTURA.md).
