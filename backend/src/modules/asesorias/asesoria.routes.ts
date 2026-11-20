import { Router } from "express";
import { AsesoriaController } from "./asesoria.controller";
import { authMiddleware } from "../../shared/middlewares/auth";
import { permitirRoles } from "../../shared/middlewares/roles";

const router = Router();
const controller = new AsesoriaController();

// Lectura pública; crear y borrar requieren sesión de docente o admin
// (antes cualquiera podía hacerlo sin autenticarse).
router.get("/", controller.listar);
router.post("/", authMiddleware, permitirRoles("docente", "admin"), controller.agregar);
router.delete("/:id", authMiddleware, permitirRoles("docente", "admin"), controller.eliminar);

export default router;
