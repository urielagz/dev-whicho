import RepositorioMaterias from "./materia.repository";
import RepositorioTemas from "../temas/tema.repository";
import RepositorioChat from "../chat/chat.repository";
import RepositorioProgreso from "../progreso/progreso.repository";
import RepositorioUsuarios from "../usuarios/usuario.repository";
import { notificarMateria, correoMateria } from "../notificaciones/notificacion.service";
import { enviarCorreo } from "../../config/mailer";
import { subirArchivo } from "../../config/cloudinary";
import { HttpError } from "../../shared/http/HttpError";
import type { PayloadJWT } from "../../shared/utils/jwt";

type Archivo = Express.Multer.File | undefined;

export interface DatosMateria {
    nombre?: string;
    color?: string;
    orden?: number;
    icono?: string;
    id_docente?: number;
}

async function obtenerOFallar(id: number) {
    const materia = await RepositorioMaterias.obtenerPorId(id);
    if (!materia) throw HttpError.noEncontrado("Materia no encontrada.");
    return materia;
}

// Un docente solo puede operar sobre sus propias materias; el admin sobre todas.
async function exigirPropietario(usuario: PayloadJWT, idMateria: number, mensaje: string) {
    if (usuario.rol !== "docente") return;
    if (!(await RepositorioMaterias.esDelDocente(idMateria, usuario.id))) throw HttpError.prohibido(mensaje);
}

const subirIcono = (archivo: Archivo) =>
    archivo ? subirArchivo(archivo.buffer, archivo.originalname, "materias") : Promise.resolve(undefined);

/*
 * Reglas de negocio de Materia. No conoce req/res: recibe datos ya
 * validados (materia.schemas.ts) y lanza HttpError cuando algo no procede.
 */
export const MateriaService = {

    listar: () => RepositorioMaterias.obtenerTodas(),

    obtener: obtenerOFallar,

    listarDelDocente: (idDocente: number) => RepositorioMaterias.obtenerPorDocente(idDocente),

    listarInscritas: (idAlumno: number) => RepositorioMaterias.obtenerInscritasPorAlumno(idAlumno),

    async crear(usuario: PayloadJWT, datos: DatosMateria, archivo: Archivo) {
        // Un docente crea siempre para sí mismo; el admin debe indicar el docente.
        const idDocente = usuario.rol === "docente" ? usuario.id : datos.id_docente;
        if (!idDocente) throw HttpError.solicitudInvalida("Indica el docente de la materia (id_docente).");
        if (usuario.rol === "docente" && datos.id_docente && datos.id_docente !== usuario.id) {
            throw HttpError.prohibido("No puedes crear materias para otro docente.");
        }

        const icono = (await subirIcono(archivo)) ?? datos.icono;
        const materia = await RepositorioMaterias.crear({
            nombre: datos.nombre!, icono, color: datos.color, orden: datos.orden, id_docente: idDocente,
        });

        // El chat de la materia se crea junto con ella (los alumnos entran solos
        // al inscribirse). Best-effort: si falla, la materia ya quedó creada y
        // el docente puede crear el chat después con POST /chats.
        try {
            await RepositorioChat.crearGrupoMateria(materia.id_materia, idDocente, materia.nombre);
        } catch (error) {
            console.error("No se pudo crear el chat de la materia:", error);
        }

        // El token de inscripción también va por correo. No se espera la respuesta.
        RepositorioUsuarios.buscarPorId(idDocente)
            .then(docente => docente && enviarCorreo(
                docente.correo,
                `Token de inscripción para "${materia.nombre}" - Dev Whicho`,
                `<p>Hola ${docente.nombre}, creaste la materia <strong>${materia.nombre}</strong>.</p>
                 <p>Comparte este token con tus alumnos para que se inscriban:</p>
                 <p style="font-size:20px;"><strong>${materia.token}</strong></p>`
            ))
            .catch(error => console.error("No se pudo enviar el correo del token de materia:", error));

        return materia;
    },

    // Los campos que no se envían conservan su valor actual.
    async actualizar(usuario: PayloadJWT, id: number, datos: DatosMateria, archivo: Archivo) {
        const actual = await obtenerOFallar(id);
        await exigirPropietario(usuario, id, "No puedes modificar esta materia.");

        return RepositorioMaterias.actualizar(id, {
            nombre: datos.nombre ?? actual.nombre,
            icono: (await subirIcono(archivo)) ?? datos.icono ?? actual.icono,
            color: datos.color ?? actual.color,
            orden: datos.orden ?? actual.orden,
            id_docente: actual.id_docente,
        });
    },

    async eliminar(usuario: PayloadJWT, id: number) {
        await exigirPropietario(usuario, id, "No puedes eliminar esta materia.");
        if (!(await RepositorioMaterias.eliminar(id))) throw HttpError.noEncontrado("Materia no encontrada.");
    },

    // Roster completo de inscritos con su avance (incluye a quien no ha entregado nada).
    async alumnosConProgreso(usuario: PayloadJWT, id: number) {
        await obtenerOFallar(id);
        await exigirPropietario(usuario, id, "No puedes ver los alumnos de esta materia.");

        const roster = await RepositorioMaterias.obtenerRosterInscritos(id);
        return Promise.all(roster.map(async alumno => ({
            ...alumno,
            progreso: await RepositorioProgreso.calcularYGuardar(alumno.id_usuario, id),
        })));
    },

    // Temas ordenados con indicador de actividades/exámenes.
    async indice(usuario: PayloadJWT, id: number) {
        if (!(await RepositorioMaterias.existe(id))) throw HttpError.noEncontrado("Materia no encontrada.");
        if (usuario.rol === "alumno" && !(await RepositorioMaterias.estaInscrito(usuario.id, id))) {
            throw HttpError.prohibido("No estás inscrito en esta materia.");
        }
        return { temas: await RepositorioTemas.buscarIndicePorMateria(id) };
    },

    // El token solo se expone a su docente (o a un admin).
    async token(usuario: PayloadJWT, id: number) {
        await obtenerOFallar(id);
        await exigirPropietario(usuario, id, "No puedes ver el token de una materia que no es tuya.");
        return RepositorioMaterias.obtenerToken(id);
    },

    async inscribir(idAlumno: number, token: string) {
        const materia = await RepositorioMaterias.buscarPorToken(token);
        if (!materia) throw HttpError.noEncontrado("Token inválido. Verifica que esté bien escrito.");
        if (await RepositorioMaterias.estaInscrito(idAlumno, materia.id_materia)) {
            throw HttpError.conflicto("Ya estás inscrito en esta materia.");
        }
        await RepositorioMaterias.inscribir(idAlumno, materia.id_materia);
        return materia;
    },

    // Aviso importante: notificación in-app + correo a todos los inscritos.
    async enviarAviso(usuario: PayloadJWT, id: number, titulo: string, mensaje: string) {
        const materia = await obtenerOFallar(id);
        await exigirPropietario(usuario, id, "No puedes enviar avisos en una materia que no es tuya.");

        await notificarMateria(id, "aviso", titulo, mensaje);
        correoMateria(
            id,
            `Aviso importante: ${titulo} - Dev Whicho`,
            alumno => `<p>Hola ${alumno.nombre}, tu docente envió un aviso importante en "${materia.nombre}".</p>
                       <p><strong>${titulo}</strong></p><p>${mensaje}</p>`
        ).catch(error => console.error("No se pudo enviar el correo del aviso:", error));
    },
};
