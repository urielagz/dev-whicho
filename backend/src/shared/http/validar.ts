import { NextFunction, Request, Response } from "express";
import { z, ZodTypeAny } from "zod";

interface Esquemas {
    body?: ZodTypeAny;
    params?: ZodTypeAny;
}

/*
 * Valida y normaliza la entrada de una ruta con zod antes de llegar al
 * controlador. Si falla, el ZodError llega al manejador global, que responde
 * 400 con el primer mensaje legible.
 *
 *   router.post("/", validar({ body: esquemaLogin }), controller.login);
 *
 * El body validado reemplaza a req.body (ya con trim, mayúsculas, números
 * convertidos, etc.). Los params validados quedan en res.locals.params,
 * porque en Express 5 req.params no se debe reasignar.
 */
export function validar(esquemas: Esquemas) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (esquemas.body) req.body = esquemas.body.parse(req.body ?? {});
        if (esquemas.params) res.locals.params = esquemas.params.parse(req.params);
        next();
    };
}

/* Piezas reutilizables para los esquemas de cada módulo. */
export const campos = {
    id: z.coerce.number({ invalid_type_error: "ID inválido." }).int("ID inválido.").positive("ID inválido."),
    texto: (nombre: string) => z.string({ required_error: `${nombre} es obligatorio.` }).trim().min(1, `${nombre} es obligatorio.`),
    // Sin toLowerCase: hay cuentas guardadas con mayúsculas y el login compara exacto.
    correo: z.string({ required_error: "El correo es obligatorio." }).trim().email("Correo inválido."),
    contrasena: z.string({ required_error: "La contraseña es obligatoria." }).min(6, "La contraseña debe tener al menos 6 caracteres."),
};

export const paramsId = z.object({ id: campos.id });
