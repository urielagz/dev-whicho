import "dotenv/config";

/*
 * Única fuente de verdad para la configuración de Dev Whicho.
 *
 * Todo el código lee de aquí en lugar de usar `process.env` directamente,
 * así los valores por defecto (y el secreto del JWT) viven en un solo lugar
 * y no se desincronizan entre authMiddleware, socket.ts y generarJWT.
 */

function numero(valor: string | undefined, porDefecto: number): number {
    const n = Number(valor);
    return Number.isFinite(n) && valor !== undefined && valor !== "" ? n : porDefecto;
}

const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET_POR_DEFECTO = "SECRETO_SUPER_SECRETO";

export const env = {
    APP_NAME: process.env.APP_NAME || "Dev Whicho",
    NODE_ENV,
    esProduccion: NODE_ENV === "production",

    PORT: numero(process.env.PORT, 7000),

    // Orígenes permitidos para CORS (separados por coma). "*" = cualquiera.
    CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
    get corsOrigenes(): string | string[] {
        return this.CORS_ORIGIN === "*" ? "*" : this.CORS_ORIGIN.split(",").map((o: string) => o.trim());
    },

    JWT_SECRET: process.env.JWT_SECRET || JWT_SECRET_POR_DEFECTO,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",

    db: {
        url: process.env.DATABASE_URL,
        host: process.env.DB_HOST || "localhost",
        port: numero(process.env.DB_PORT, 5432),
        database: process.env.DB_NAME || "prueba7",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "12345",
    },

    UPLOADS_PATH: process.env.UPLOADS_PATH || "uploads",

    mail: {
        resendApiKey: process.env.RESEND_API_KEY,
        remitente: process.env.MAIL_FROM || "Dev Whicho <onboarding@resend.dev>",
        adminEmail: process.env.ADMIN_EMAIL,
    },

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        carpetaRaiz: process.env.CLOUDINARY_FOLDER || "dev-whicho",
    },
};

if (env.esProduccion && env.JWT_SECRET === JWT_SECRET_POR_DEFECTO) {
    console.warn("[env] JWT_SECRET no está definido: se usa el valor por defecto. Defínelo en producción.");
}
