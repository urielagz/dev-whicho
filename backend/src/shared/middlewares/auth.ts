import { Request, Response, NextFunction } from "express";
import { verificarJWT } from "../utils/jwt";
import { HttpError } from "../http/HttpError";

/*
 * Exige "Authorization: Bearer <jwt>" y deja el payload en req.usuario
 * (tipado en src/types/express.d.ts).
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    const [esquema, token] = (req.headers.authorization ?? "").split(" ");

    if (!esquema) throw HttpError.noAutenticado("Token requerido");
    if (esquema.toLowerCase() !== "bearer" || !token) throw HttpError.noAutenticado("Token inválido");

    try {
        req.usuario = verificarJWT(token);
    } catch {
        throw HttpError.noAutenticado("Token inválido");
    }
    next();
}
