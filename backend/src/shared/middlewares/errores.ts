import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { env } from "../../config/env";
import { HttpError } from "../http/HttpError";

// 404 en JSON para cualquier ruta que no exista.
export function noEncontrado(req: Request, res: Response) {
    res.status(404).json({
        ok: false,
        mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
}

/*
 * Manejador global: toda la API responde errores con el mismo formato
 * { ok:false, mensaje }. Express 5 ya reenvía aquí las promesas rechazadas
 * de los handlers async, así que los controladores pueden simplemente lanzar.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function manejadorErrores(err: any, _req: Request, res: Response, _next: NextFunction) {
    if (res.headersSent) return;

    if (err instanceof HttpError) {
        return res.status(err.status).json({ ok: false, mensaje: err.message });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({ ok: false, mensaje: err.issues[0]?.message ?? "Datos inválidos." });
    }

    if (err instanceof multer.MulterError) {
        const mensaje = err.code === "LIMIT_FILE_SIZE"
            ? "El archivo excede el tamaño máximo permitido."
            : err.code === "LIMIT_UNEXPECTED_FILE"
                ? "Demasiados archivos o campo de archivo no esperado."
                : err.message;
        return res.status(400).json({ ok: false, mensaje });
    }

    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({ ok: false, mensaje: "JSON inválido en el cuerpo de la petición." });
    }

    // Violación de UNIQUE en PostgreSQL
    if (err?.code === "23505") {
        return res.status(409).json({ ok: false, mensaje: "El registro ya existe." });
    }

    console.error(err);

    res.status(500).json({
        ok: false,
        mensaje: env.esProduccion ? "Error del servidor." : (err?.message || "Error del servidor.")
    });
}
