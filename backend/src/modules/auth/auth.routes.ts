import { Router } from "express";
import { AuthController } from "./auth.controller";
import { esquemaLogin } from "./auth.schemas";
import { validar } from "../../shared/http/validar";
import { limiteAutenticacion } from "../../shared/middlewares/limites";

// POST /login. Registro y recuperación de contraseña viven bajo /usuarios
// (ver usuario.routes.ts) por compatibilidad con los clientes existentes.
const router = Router();

router.post("/", limiteAutenticacion, validar({ body: esquemaLogin }), AuthController.login);

export default router;
