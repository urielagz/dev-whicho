import { Request, Response } from "express";
import { AuthService } from "./auth.service";

// Capa HTTP: el body ya llega validado por los esquemas de auth.schemas.ts.
export const AuthController = {

    async login(req: Request, res: Response) {
        const { token, usuario } = await AuthService.iniciarSesion(req.body.correo, req.body.contraseña);
        res.json({ ok: true, token, data: usuario });
    },

    async registrar(req: Request, res: Response) {
        const usuario = await AuthService.registrarAlumno(req.body);
        res.status(201).json({ ok: true, data: usuario });
    },

    async olvideContrasena(req: Request, res: Response) {
        await AuthService.solicitarRecuperacion(req.body.correo);
        res.json({ ok: true, mensaje: "Si el correo está registrado, te enviamos un código de recuperación." });
    },

    async restablecerContrasena(req: Request, res: Response) {
        await AuthService.restablecerContrasena(req.body.token, req.body.nuevaContraseña);
        res.json({ ok: true, mensaje: "Contraseña actualizada correctamente." });
    },

    async cambiarContrasena(req: Request, res: Response) {
        await AuthService.cambiarContrasena(req.usuario!.id, req.body.contraseñaActual, req.body.nuevaContraseña);
        res.json({ ok: true, mensaje: "Contraseña actualizada correctamente." });
    },
};
