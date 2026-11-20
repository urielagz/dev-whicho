import { Pool } from "pg";
import { env } from "./env";

// El esquema completo vive en backend/database/database.sql.
// Aplícalo manualmente antes de usar la API.

// En Render (o cualquier proveedor que dé una sola cadena de conexión)
// basta con DATABASE_URL; en local, sin esa variable, se usan DB_HOST,
// DB_PORT, DB_NAME, DB_USER y DB_PASSWORD (ver .env.example).
export const pool = env.db.url
    ? new Pool({
        connectionString: env.db.url,
        ssl: { rejectUnauthorized: false }
    })
    : new Pool({
        host: env.db.host,
        port: env.db.port,
        database: env.db.database,
        user: env.db.user,
        password: env.db.password
    });

// No se hace connect() inmediato para que el arranque no falle si la BD
// todavía no está disponible; el pool abre conexiones bajo demanda.
