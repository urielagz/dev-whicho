/*
 * Error con código HTTP. Un servicio o controlador lo lanza y el manejador
 * global (shared/middlewares/errores.ts) responde { ok:false, mensaje } con
 * ese status. Así la lógica no necesita conocer `res` para fallar.
 *
 *   throw HttpError.noEncontrado("Materia no encontrada.");
 */
export class HttpError extends Error {
    constructor(public readonly status: number, mensaje: string) {
        super(mensaje);
        this.name = "HttpError";
    }

    static solicitudInvalida(mensaje = "Solicitud inválida.") { return new HttpError(400, mensaje); }
    static noAutenticado(mensaje = "Token requerido") { return new HttpError(401, mensaje); }
    static prohibido(mensaje = "Acceso denegado") { return new HttpError(403, mensaje); }
    static noEncontrado(mensaje = "No encontrado.") { return new HttpError(404, mensaje); }
    static conflicto(mensaje: string) { return new HttpError(409, mensaje); }
}
