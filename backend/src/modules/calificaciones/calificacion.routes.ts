import { Router } from "express";

import CalificacionController from "./calificacion.controller";

import { authMiddleware } from "../../shared/middlewares/auth";
import { permitirRoles } from "../../shared/middlewares/roles";

const router = Router();

router.get(
    "/materia/:idMateria/mis-calificaciones",
    authMiddleware,
    permitirRoles("alumno"),
    CalificacionController.misCalificaciones
);

router.get(
    "/materia/:idMateria",
    authMiddleware,
    permitirRoles("docente", "admin"),
    CalificacionController.obtenerPorMateria
);

export default router;
