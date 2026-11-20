import type { PayloadJWT } from "../shared/utils/jwt";

/*
 * El middleware de autenticación (shared/middlewares/auth.ts) deja aquí el
 * payload del JWT. Declararlo evita los `(req as any).usuario`.
 */
declare global {
    namespace Express {
        interface Request {
            usuario?: PayloadJWT;
        }
    }
}

export {};
