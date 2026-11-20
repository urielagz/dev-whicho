import { Router } from "express";

// Usuarios y acceso
import usuarioRoutes from "./modules/usuarios/usuario.routes";
import loginRoutes from "./modules/auth/auth.routes";
import docenteRoutes from "./modules/docentes/docente.routes";
import anuncioRoutes from "./modules/anuncios/anuncio.routes";
import asesoriaRoutes from "./modules/asesorias/asesoria.routes";

// Módulo académico: Materia -> Índice -> Tema -> Recurso / Actividad / Examen
import materiaRoutes from "./modules/materias/materia.routes";
import temaRoutes from "./modules/temas/tema.routes";
import recursoRoutes from "./modules/recursos/recurso.routes";
import actividadRoutes from "./modules/actividades/actividad.routes";
import examenRoutes from "./modules/examenes/examen.routes";
import calificacionRoutes from "./modules/calificaciones/calificacion.routes";
import progresoRoutes from "./modules/progreso/progreso.routes";

// Comunidad: feed acotado por materia
import publicacionRoutes from "./modules/publicaciones/publicacion.routes";
import comentarioRoutes from "./modules/comentarios/comentario.routes";

// Dashboard del alumno: notificaciones, calendario/recordatorios, recomendados
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

// Chat: público general + grupos por materia (tiempo real en config/socket.ts)
import chatRoutes from "./modules/chat/chat.routes";

/*
 * Mapa único "prefijo -> router". Para agregar un módulo nuevo basta con
 * crear su archivo *.routes.ts y registrarlo aquí; app.ts no cambia.
 * Los prefijos son exactamente los mismos que antes, el frontend no se ve
 * afectado.
 */
export const modulos: Array<[string, Router]> = [
    ["/usuarios", usuarioRoutes],
    ["/login", loginRoutes],
    ["/docentes", docenteRoutes],
    ["/anuncios", anuncioRoutes],
    ["/asesorias", asesoriaRoutes],

    ["/materias", materiaRoutes],
    ["/temas", temaRoutes],
    ["/recursos", recursoRoutes],
    ["/actividades", actividadRoutes],
    ["/examenes", examenRoutes],
    ["/calificaciones", calificacionRoutes],
    ["/progreso", progresoRoutes],

    ["/publicaciones", publicacionRoutes],
    ["/comentarios", comentarioRoutes],

    ["/dashboard", dashboardRoutes],

    ["/chats", chatRoutes],
];

const router = Router();

for (const [prefijo, rutas] of modulos) {
    router.use(prefijo, rutas);
}

export default router;
