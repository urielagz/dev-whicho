import { api, apiData, descargarArchivo } from "@/lib/api";
import type { Actividad, AlumnoInscrito, Entrega, Examen, Materia, Recurso, Tema } from "@/types";

/*
 * API del módulo académico, compartida por el panel del docente (gestión) y
 * el del alumno (lectura y entregas). Las claves de caché viven junto a las
 * funciones para invalidar siempre lo mismo que se consulta.
 */
export const claves = {
  materiasDocente: ["materias", "docente"] as const,
  materiasInscritas: ["materias", "inscritas"] as const,
  temas: (idMateria: number) => ["temas", "materia", idMateria] as const,
  recursos: (idTema: number) => ["recursos", "tema", idTema] as const,
  actividades: (idTema: number) => ["actividades", "tema", idTema] as const,
  examenes: (idTema: number) => ["examenes", "tema", idTema] as const,
  actividad: (id: number) => ["actividad", id] as const,
  examen: (id: number) => ["examen", id] as const,
  alumnos: (idMateria: number) => ["materias", idMateria, "alumnos"] as const,
  entregas: (idActividad: number) => ["actividades", idActividad, "entregas"] as const,
  misEntregas: ["actividades", "mis-entregas"] as const,
};

const JSON_ = (metodo: "POST" | "PUT", cuerpo: unknown) => ({ metodo, cuerpo });

export const materiasApi = {
  delDocente: () => apiData<Materia[]>("/materias/docente"),
  inscritas: () => apiData<Materia[]>("/materias/inscritas"),
  // id_docente: el backend lo exige al admin (un docente siempre crea para sí mismo).
  crear: (nombre: string, idDocente: number) => apiData<Materia>("/materias", JSON_("POST", { nombre, id_docente: idDocente })),
  actualizar: (id: number, cuerpo: FormData) => apiData<Materia>(`/materias/${id}`, { metodo: "PUT", cuerpo }),
  eliminar: (id: number) => api(`/materias/${id}`, { metodo: "DELETE" }),
  token: (id: number) => apiData<{ token: string }>(`/materias/${id}/token`).then(d => d.token),
  alumnos: (id: number) => apiData<AlumnoInscrito[]>(`/materias/${id}/alumnos`),
  inscribirse: (token: string) => api<Materia>("/materias/inscribirse", JSON_("POST", { token })),
};

export const temasApi = {
  deMateria: (idMateria: number) => apiData<Tema[]>(`/temas/materia/${idMateria}`),
  crear: (datos: { nombre: string; descripcion: string; id_materia: number }) => apiData<Tema>("/temas", JSON_("POST", datos)),
  actualizar: (id: number, datos: { nombre: string; descripcion: string }) => apiData<Tema>(`/temas/${id}`, JSON_("PUT", datos)),
  actualizarContenido: (id: number, cuerpo: FormData) => apiData<Tema>(`/temas/${id}/contenido`, { metodo: "PUT", cuerpo }),
  eliminar: (id: number) => api(`/temas/${id}`, { metodo: "DELETE" }),
};

export const recursosApi = {
  deTema: (idTema: number) => apiData<Recurso[]>(`/recursos/tema/${idTema}`),
  crear: (cuerpo: FormData) => apiData<Recurso>("/recursos", { metodo: "POST", cuerpo }),
  eliminar: (id: number) => api(`/recursos/${id}`, { metodo: "DELETE" }),
  descargar: (id: number, indice: number) => descargarArchivo(`/recursos/${id}/descargar/${indice}`),
};

export const actividadesApi = {
  deTema: (idTema: number) => apiData<Actividad[]>(`/actividades/tema/${idTema}`),
  porId: (id: number) => apiData<Actividad>(`/actividades/${id}`),
  crear: (cuerpo: FormData) => apiData<Actividad>("/actividades", { metodo: "POST", cuerpo }),
  actualizar: (id: number, cuerpo: FormData) => apiData<Actividad>(`/actividades/${id}`, { metodo: "PUT", cuerpo }),
  eliminar: (id: number) => api(`/actividades/${id}`, { metodo: "DELETE" }),
  entregas: (id: number) => apiData<Entrega[]>(`/actividades/${id}/entregas`),
  calificar: (idEntrega: number, calificacion: number, observaciones: string) =>
    api(`/actividades/entregas/${idEntrega}/calificar`, JSON_("PUT", { calificacion, observaciones_docente: observaciones })),
  misEntregas: () => apiData<Entrega[]>("/actividades/alumno/mis-entregas"),
  entregar: (id: number, cuerpo: FormData) => api(`/actividades/${id}/entregar`, { metodo: "POST", cuerpo }),
  retirarEntrega: (id: number) => api(`/actividades/${id}/entregar`, { metodo: "DELETE" }),
};

export const examenesApi = {
  deTema: (idTema: number) => apiData<Examen[]>(`/examenes/tema/${idTema}`),
  porId: (id: number) => apiData<Examen>(`/examenes/${id}`),
  crear: (datos: Partial<Examen>) => apiData<Examen>("/examenes", JSON_("POST", datos)),
  actualizar: (id: number, datos: Partial<Examen>) => apiData<Examen>(`/examenes/${id}`, JSON_("PUT", datos)),
  eliminar: (id: number) => api(`/examenes/${id}`, { metodo: "DELETE" }),
};
