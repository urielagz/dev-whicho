import { Router } from "express";

import ActividadController from "./actividad.controller";

import { authMiddleware } from "../../shared/middlewares/auth";
import { permitirRoles } from "../../shared/middlewares/roles";
import { uploadEntrega, uploadActividadApoyo } from "../../shared/upload/uploadAcademico";

const router = Router();

/*
==========================================
CONSULTAS (todos los roles autenticados)
==========================================
*/

router.get(
    "/tema/:idTema",
    authMiddleware,
    ActividadController.obtenerPorTema
);

router.get(
    "/alumno/mis-entregas",
    authMiddleware,
    permitirRoles("alumno"),
    ActividadController.misEntregas
);

router.get(
    "/:id",
    authMiddleware,
    ActividadController.obtenerPorId
);

/*
==========================================
DOCENTE Y ADMIN: CRUD y revisión de entregas
==========================================
*/

router.post(
    "/",
    authMiddleware,
    permitirRoles("docente", "admin"),
    uploadActividadApoyo.array("archivos_apoyo", 5),
    ActividadController.crear
);

router.put(
    "/:id",
    authMiddleware,
    permitirRoles("docente", "admin"),
    uploadActividadApoyo.array("archivos_apoyo", 5),
    ActividadController.actualizar
);

router.delete(
    "/:id",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ActividadController.eliminar
);

router.get(
    "/:id/entregas",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ActividadController.obtenerEntregas
);

router.put(
    "/entregas/:idEntrega/calificar",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ActividadController.calificar
);

/*
==========================================
ALUMNO: entrega de actividades
==========================================
*/

router.post(
    "/:id/entregar",
    authMiddleware,
    permitirRoles("alumno"),
    uploadEntrega.array("archivos", 5),
    ActividadController.entregar
);

router.delete(
    "/:id/entregar",
    authMiddleware,
    permitirRoles("alumno"),
    ActividadController.eliminarEntrega
);

export default router;
