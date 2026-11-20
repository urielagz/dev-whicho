import { apiData, formData } from "@/lib/api";
import type { GrupoChat, MensajeChat } from "@/types";

export const clavesChat = {
  grupos: ["chats"] as const,
  mensajes: (idGrupo: number) => ["chats", idGrupo, "mensajes"] as const,
};

export const chatApi = {
  grupos: () => apiData<GrupoChat[]>("/chats"),
  mensajes: (idGrupo: number) => apiData<MensajeChat[]>(`/chats/${idGrupo}/mensajes`),
  enviar: (idGrupo: number, contenido: string | undefined, archivos: File[]) =>
    apiData<MensajeChat>(`/chats/${idGrupo}/mensajes`, {
      metodo: "POST",
      cuerpo: formData({ contenido, archivos }),
    }),
};

/*
 * El backend no soporta "responder a un mensaje": la cita se antepone como
 * texto ("> Autor: fragmento\n...") y aquí se separa para pintarla aparte.
 */
export function separarCita(contenido?: string | null): { cita: string | null; texto: string } {
  if (!contenido || !contenido.startsWith("> ")) return { cita: null, texto: contenido ?? "" };
  const salto = contenido.indexOf("\n");
  if (salto === -1) return { cita: contenido.slice(2), texto: "" };
  return { cita: contenido.slice(2, salto), texto: contenido.slice(salto + 1) };
}

export function componerConCita(texto: string, cita: { autor: string; fragmento: string } | null): string {
  return cita ? `> ${cita.autor}: ${cita.fragmento}\n${texto}` : texto;
}

export function autorDe(msg: MensajeChat): string {
  const p = msg.autor ?? msg.usuario;
  return p ? `${p.nombre} ${p.apellido ?? ""}`.trim() : `Usuario #${msg.id_usuario}`;
}
