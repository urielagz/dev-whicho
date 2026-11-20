import { Router } from "express";

import ExamenController from "./examen.controller";

import { authMiddleware } from "../../shared/middlewares/auth";
import { permitirRoles } from "../../shared/middlewares/roles";

const router = Router();

/*
==========================================
CONSULTAS (todos los roles autenticados; el alumno debe estar inscrito
en la materia del tema -- ver ExamenController)
==========================================
*/

router.get(
    "/tema/:idTema",
    authMiddleware,
    ExamenController.obtenerPorTema
);

router.get(
    "/:id",
    authMiddleware,
    ExamenController.obtenerPorId
);

/*
==========================================
DOCENTE Y ADMIN
==========================================
*/

router.post(
    "/",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ExamenController.crear
);

router.put(
    "/:id",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ExamenController.actualizar
);

router.delete(
    "/:id",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ExamenController.eliminar
);

export default router;
