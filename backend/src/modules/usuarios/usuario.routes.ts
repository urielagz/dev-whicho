import { Router } from "express";
import { z } from "zod";

import { UsuarioController } from "./usuario.controller";
import { AuthController } from "../auth/auth.controller";
import {
    esquemaCambiarContrasena,
    esquemaLogin,
    esquemaOlvide,
    esquemaRegistro,
    esquemaRestablecer,
} from "../auth/auth.schemas";
import { authMiddleware } from "../../shared/middlewares/auth";
import { adminMiddleware } from "../../shared/middlewares/admin";
import { limiteAutenticacion, limiteCorreos } from "../../shared/middlewares/limites";
import { validar, paramsId } from "../../shared/http/validar";

const router = Router();

const esquemaPerfil = z.object({
    nombre: z.string().trim().min(1).optional(),
    apellido: z.string().trim().min(1).optional(),
    correo: z.string().trim().email("Correo inválido.").optional(),
    biografia: z.string().trim().max(500).optional(),
});

// ---------- Públicas (con límite de intentos) ----------
router.post("/", limiteAutenticacion, validar({ body: esquemaRegistro }), AuthController.registrar);
router.post("/login", limiteAutenticacion, validar({ body: esquemaLogin }), AuthController.login);
router.post("/forgot-password", limiteCorreos, validar({ body: esquemaOlvide }), AuthController.olvideContrasena);
router.post("/reset-password", limiteAutenticacion, validar({ body: esquemaRestablecer }), AuthController.restablecerContrasena);

// ---------- Usuario autenticado ----------
router.put("/cambiar-password", authMiddleware, validar({ body: esquemaCambiarContrasena }), AuthController.cambiarContrasena);
router.put("/perfil", authMiddleware, validar({ body: esquemaPerfil }), UsuarioController.actualizarPerfil);
router.get("/:id", authMiddleware, validar({ params: paramsId }), UsuarioController.buscarPorId);

// ---------- Admin ----------
router.get("/", authMiddleware, adminMiddleware, UsuarioController.listar);
router.delete("/:id", authMiddleware, adminMiddleware, validar({ params: paramsId }), UsuarioController.eliminar);

export default router;
