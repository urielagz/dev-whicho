import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export interface PayloadJWT {
    id: number;
    rol: string;
}

// El login es stateless (JWT): "cerrar sesión" solo borra el token del
// localStorage del navegador. La duración por defecto es larga (30 días)
// para no sacar al usuario a media clase; se cambia con JWT_EXPIRES_IN.
export const generarJWT = (id: number, rol: string): string => {
    return jwt.sign({ id, rol }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any
    });
};

// Usado por authMiddleware (REST) y por config/socket.ts (Socket.IO):
// así ambos validan con exactamente el mismo secreto.
export const verificarJWT = (token: string): PayloadJWT => {
    return jwt.verify(token, env.JWT_SECRET) as PayloadJWT;
};
