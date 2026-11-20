import { Router } from "express";
import ComentarioController from "./comentario.controller";
import { authMiddleware } from "../../shared/middlewares/auth";

const router = Router();

router.delete("/:id", authMiddleware, ComentarioController.eliminar);

export default router;
