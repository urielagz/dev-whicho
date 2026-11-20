import rateLimit from "express-rate-limit";

/*
 * Límite de peticiones para los endpoints públicos que se pueden abusar:
 * login (fuerza bruta), registro, recuperación de contraseña (envía correos)
 * y solicitud de docente (sube archivos y envía correos).
 */
const respuesta = { ok: false, mensaje: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };

export const limiteAutenticacion = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: respuesta,
});

export const limiteCorreos = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: respuesta,
});
