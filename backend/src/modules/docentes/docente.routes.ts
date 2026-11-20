import { Router } from "express";
import { DocenteController } from "./docente.controller";
import { authMiddleware } from "../../shared/middlewares/auth";
import { adminMiddleware } from "../../shared/middlewares/admin";
import { upload } from "../../shared/upload/uploadDocentes";
import { limiteCorreos } from "../../shared/middlewares/limites";

const router = Router();
const controller = new DocenteController();

router.post(
    "/solicitud",
    limiteCorreos,
    upload.fields([
        { name: "cedula_profesional", maxCount: 1 },
        { name: "diploma", maxCount: 1 }
    ]),
    controller.solicitar
);

router.get("/pendientes", authMiddleware, adminMiddleware, controller.listarPendientes);
router.post("/:id/aprobar", authMiddleware, adminMiddleware, controller.aprobar);
router.post("/:id/rechazar", authMiddleware, adminMiddleware, controller.rechazar);

export default router;