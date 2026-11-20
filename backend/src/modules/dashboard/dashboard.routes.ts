import { Router } from "express";
import DashboardController from "./dashboard.controller";
import { authMiddleware } from "../../shared/middlewares/auth";
import { permitirRoles } from "../../shared/middlewares/roles";

const router = Router();

router.get("/notificaciones", authMiddleware, permitirRoles("alumno"), DashboardController.notificaciones);
router.put("/notificaciones/:id/leida", authMiddleware, permitirRoles("alumno"), DashboardController.marcarNotificacionLeida);
router.get("/calendario", authMiddleware, permitirRoles("alumno"), DashboardController.calendario);
router.get("/recomendados", authMiddleware, permitirRoles("alumno"), DashboardController.recomendados);

export default router;
