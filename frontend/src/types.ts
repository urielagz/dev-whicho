// Tipos de dominio tal como los devuelve la API (snake_case del backend).

export type Rol = "alumno" | "docente" | "admin";

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
  foto_perfil?: string | null;
  biografia?: string | null;
  fecha_registro?: string;
}

export interface Archivo {
  url: string;
  nombre_original?: string;
  tipo?: string;
}

export interface Materia {
  id_materia: number;
  nombre: string;
  icono?: string | null;
  color?: string | null;
  orden?: number | null;
  id_docente: number;
  token?: string;
}

export interface Tema {
  id_tema: number;
  nombre: string;
  descripcion?: string | null;
  introduccion?: string | null;
  contenido?: string | null;
  imagen1?: string | null;
  imagen2?: string | null;
  orden?: number;
  id_materia: number;
}

export interface Recurso {
  id_recurso: number;
  titulo: string;
  descripcion?: string | null;
  archivos?: Archivo[];
  id_tema: number;
}

export interface Actividad {
  id_actividad: number;
  titulo: string;
  descripcion?: string | null;
  fecha_limite?: string | null;
  puntaje?: number | null;
  archivos_permitidos?: string | null;
  archivos_apoyo?: Archivo[];
  id_tema: number;
}

export interface Examen {
  id_examen: number;
  titulo: string;
  descripcion?: string | null;
  url_formulario: string;
  fecha_limite?: string | null;
  id_tema: number;
}

export interface Entrega {
  id_registro: number;
  id_actividad: number;
  id_usuario: number;
  nombre?: string;
  apellido?: string;
  comentario_alumno?: string | null;
  url_entrega?: string | null;
  archivos?: Archivo[];
  calificacion?: number | null;
  observaciones_docente?: string | null;
  fecha_entrega?: string;
}

export interface Progreso {
  porcentaje_avance: number | string;
  act_completas: number;
}

export interface AlumnoInscrito {
  id_usuario: number;
  nombre: string;
  apellido?: string;
  correo: string;
  progreso?: Progreso | null;
}

export interface MateriaConProgreso extends Materia {
  progreso?: Progreso | null;
}

export interface GrupoChat {
  id_grupo: number;
  nombre: string;
  id_materia?: number | null;
}

export interface MensajeChat {
  id_mensaje?: number;
  id_grupo: number;
  id_usuario: number;
  contenido?: string | null;
  archivos?: Archivo[];
  autor?: { nombre: string; apellido?: string };
  usuario?: { nombre: string; apellido?: string };
  fecha_creacion?: string;
  fecha?: string;
}

export interface Notificacion {
  id_notificacion?: number;
  id?: number;
  titulo?: string;
  mensaje?: string;
  leida?: boolean;
  fecha_creacion?: string;
  fecha?: string;
}

export interface EventoCalendario {
  tipo: "actividad" | "examen" | string;
  id: number;
  titulo?: string;
  nombre?: string;
  fecha_limite?: string;
  fecha?: string;
  id_materia?: number;
  nombre_materia?: string;
}

export interface Recomendados {
  repasar?: { temas?: { nombre: string }[]; actividades?: { titulo: string }[] };
  siguientes?: { temas?: { nombre: string }[]; actividades?: { titulo: string }[] };
}

export interface SolicitudDocente {
  id_solicitud: number;
  nombre: string;
  apellido: string;
  correo: string;
  cedula_profesional?: string | null;
  diploma?: string | null;
  fecha_solicitud: string;
}
