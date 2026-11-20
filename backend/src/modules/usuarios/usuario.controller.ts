import { Request, Response } from "express";

import RepositorioUsuarios from "./usuario.repository";
import { sinContrasena } from "../auth/auth.service";
import { HttpError } from "../../shared/http/HttpError";

// Gestión de usuarios. Login, registro y contraseñas están en modules/auth.
export const UsuarioController = {

    async listar(_req: Request, res: Response) {
        const usuarios = await RepositorioUsuarios.listar();
        res.json({ ok: true, data: usuarios.map(sinContrasena) });
    },

    async buscarPorId(_req: Request, res: Response) {
        const usuario = await RepositorioUsuarios.buscarPorId(res.locals.params.id);
        if (!usuario) throw HttpError.noEncontrado("Usuario no encontrado.");
        res.json({ ok: true, data: sinContrasena(usuario) });
    },

    async actualizarPerfil(req: Request, res: Response) {
        const { nombre, apellido, correo, biografia } = req.body;
        const usuario = await RepositorioUsuarios.actualizar(req.usuario!.id, { nombre, apellido, correo, biografia });
        if (!usuario) throw HttpError.noEncontrado("Usuario no encontrado.");
        res.json({ ok: true, mensaje: "Perfil actualizado", data: sinContrasena(usuario) });
    },

    async eliminar(_req: Request, res: Response) {
        const eliminado = await RepositorioUsuarios.eliminar(res.locals.params.id);
        if (!eliminado) throw HttpError.noEncontrado("Usuario no encontrado.");
        res.json({ ok: true, mensaje: "Eliminado" });
    },
};
