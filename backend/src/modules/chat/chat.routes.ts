import { Router } from "express";
import ChatController from "./chat.controller";
import { authMiddleware } from "../../shared/middlewares/auth";
import { permitirRoles } from "../../shared/middlewares/roles";
import { uploadChat } from "../../shared/upload/uploadAcademico";

const router = Router();

/*
==================================
Chats visibles para el usuario autenticado (público + materias
inscritas/propias). La membresía a cada grupo se valida dentro del
controller.
==================================
*/

router.get(
    "/",
    authMiddleware,
    ChatController.listar
);

router.post(
    "/",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ChatController.crearGrupoMateria
);

router.get(
    "/:id/mensajes",
    authMiddleware,
    ChatController.listarMensajes
);

router.post(
    "/:id/mensajes",
    authMiddleware,
    uploadChat.array("archivos", 5),
    ChatController.enviarMensaje
);

export default router;
