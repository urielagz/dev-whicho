import { Router } from "express";

import ProgresoController from "./progreso.controller";

import { authMiddleware } from "../../shared/middlewares/auth";
import { permitirRoles } from "../../shared/middlewares/roles";

const router = Router();

router.get(
    "/mi-progreso",
    authMiddleware,
    permitirRoles("alumno"),
    ProgresoController.miProgresoGeneral
);

router.get(
    "/materia/:idMateria/mi-progreso",
    authMiddleware,
    permitirRoles("alumno"),
    ProgresoController.miProgreso
);

router.get(
    "/materia/:idMateria",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ProgresoController.obtenerPorMateria
);

export default router;
