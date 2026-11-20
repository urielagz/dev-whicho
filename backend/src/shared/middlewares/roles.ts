import { Request, Response, NextFunction } from "express";
import { HttpError } from "../http/HttpError";

export type Rol = "alumno" | "docente" | "admin";

/* Debe ir después de authMiddleware. */
export const permitirRoles = (...roles: Rol[]) =>
    (req: Request, _res: Response, next: NextFunction) => {
        const rol = req.usuario?.rol as Rol | undefined;
        if (!rol || !roles.includes(rol)) throw HttpError.prohibido();
        next();
    };
