import { Router } from "express";

import { MateriaController } from "./materia.controller";
import { esquemaActualizarMateria, esquemaAviso, esquemaCrearMateria, esquemaInscripcion } from "./materia.schemas";
import { authMiddleware } from "../../shared/middlewares/auth";
import { permitirRoles } from "../../shared/middlewares/roles";
import { uploadIconoMateria } from "../../shared/upload/uploadAcademico";
import { validar, paramsId } from "../../shared/http/validar";

const router = Router();
const docenteOAdmin = permitirRoles("docente", "admin");
const conId = validar({ params: paramsId });

router.use(authMiddleware);

// ---------- Consultas ----------
// Las rutas fijas van antes de "/:id" para que no las capture.
router.get("/", MateriaController.obtenerTodas);
router.get("/docente", docenteOAdmin, MateriaController.obtenerPorDocente);
router.get("/inscritas", permitirRoles("alumno"), MateriaController.obtenerInscritas);
router.get("/:id", conId, MateriaController.obtenerPorId);
router.get("/:id/indice", conId, MateriaController.obtenerIndice);
router.get("/:id/token", docenteOAdmin, conId, MateriaController.obtenerToken);
router.get("/:id/alumnos", docenteOAdmin, conId, MateriaController.obtenerAlumnos);

// ---------- Inscripción (alumno, con el token que comparte el docente) ----------
router.post("/inscribirse", permitirRoles("alumno"), validar({ body: esquemaInscripcion }), MateriaController.inscribirse);

// ---------- Docente y admin ----------
router.post("/", docenteOAdmin, uploadIconoMateria.single("icono"), validar({ body: esquemaCrearMateria }), MateriaController.crear);
router.put("/:id", docenteOAdmin, conId, uploadIconoMateria.single("icono"), validar({ body: esquemaActualizarMateria }), MateriaController.actualizar);
router.delete("/:id", docenteOAdmin, conId, MateriaController.eliminar);
router.post("/:id/aviso", docenteOAdmin, conId, validar({ body: esquemaAviso }), MateriaController.avisoImportante);

export default router;
