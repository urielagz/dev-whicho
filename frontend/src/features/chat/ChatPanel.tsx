import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { chatApi, clavesChat } from "./chat.api";
import { useChatEnVivo } from "./useChatEnVivo";
import { BurbujaMensaje } from "./BurbujaMensaje";
import { Compositor, type Cita } from "./Compositor";
import { useAuth } from "@/auth/AuthContext";
import { config } from "@/config";
import { Cargando, ErrorMensaje } from "@/components/Estado";
import type { GrupoChat } from "@/types";

/* Chat compartido por el panel del alumno y el del docente. */
export function ChatPanel() {
  const { token } = useAuth();
  const [grupoActivo, setGrupoActivo] = useState<GrupoChat | null>(null);
  const [cita, setCita] = useState<Cita | null>(null);

  const grupos = useQuery({ queryKey: clavesChat.grupos, queryFn: chatApi.grupos });

  // El backend no distingue "escuela" de "global": un grupo ligado a una
  // materia es de la escuela; sin materia, es público.
  const escuela = grupos.data?.filter(g => g.id_materia) ?? [];
  const globales = grupos.data?.filter(g => !g.id_materia) ?? [];

  // Al cargar, se abre el primer chat disponible.
  useEffect(() => {
    if (!grupoActivo && grupos.data?.length) setGrupoActivo(escuela[0] ?? globales[0] ?? null);
  }, [grupos.data]); // eslint-disable-line react-hooks/exhaustive-deps

  useChatEnVivo(token, grupoActivo?.id_grupo ?? null);

  function seleccionar(grupo: GrupoChat) {
    setGrupoActivo(grupo);
    setCita(null);
  }

  return (
    <div className="chat">
      <aside className="chat-lateral">
        <ListaGrupos titulo="Chat de la escuela" grupos={escuela} cargando={grupos.isPending} error={grupos.error}
          vacio="No perteneces a ningún chat de materia todavía." activo={grupoActivo} onElegir={seleccionar} />
        <ListaGrupos titulo="Chat global" grupos={globales} cargando={grupos.isPending} error={null}
          vacio="No hay chats públicos disponibles." activo={grupoActivo} onElegir={seleccionar} />
      </aside>

      <section className="chat-activo">
        <header className="chat-activo-cabecera">
          <h3>{grupoActivo?.nombre ?? "Selecciona un chat"}</h3>
        </header>
        {grupoActivo ? (
          <>
            <Mensajes idGrupo={grupoActivo.id_grupo} onResponder={setCita} />
            <Compositor key={grupoActivo.id_grupo} idGrupo={grupoActivo.id_grupo} cita={cita} onQuitarCita={() => setCita(null)} />
          </>
        ) : (
          <p className="estado">Elige un chat de la lista para comenzar.</p>
        )}
      </section>
    </div>
  );
}

interface ListaGruposProps {
  titulo: string;
  grupos: GrupoChat[];
  cargando: boolean;
  error: unknown;
  vacio: string;
  activo: GrupoChat | null;
  onElegir: (g: GrupoChat) => void;
}

function ListaGrupos({ titulo, grupos, cargando, error, vacio, activo, onElegir }: ListaGruposProps) {
  return (
    <div className="chat-grupo">
      <span className="chat-grupo-titulo">{titulo}</span>
      {cargando ? <p className="chat-lateral-vacio">Cargando...</p>
        : error ? <p className="chat-lateral-vacio">{(error as Error).message}</p>
        : grupos.length === 0 ? <p className="chat-lateral-vacio">{vacio}</p>
        : (
          <ul>
            {grupos.map(g => (
              <li key={g.id_grupo}>
                <button type="button" className={g.id_grupo === activo?.id_grupo ? "activo" : ""} onClick={() => onElegir(g)}>
                  {g.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

function Mensajes({ idGrupo, onResponder }: { idGrupo: number; onResponder: (c: Cita) => void }) {
  const { usuario } = useAuth();
  const contenedor = useRef<HTMLDivElement>(null);

  const { data, isPending, error } = useQuery({
    queryKey: clavesChat.mensajes(idGrupo),
    queryFn: () => chatApi.mensajes(idGrupo),
    refetchInterval: config.CHAT_POLLING_MS, // respaldo del socket; solo corre con el chat montado
  });

  // Mantiene la vista pegada al último mensaje.
  useEffect(() => {
    const el = contenedor.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [data?.length]);

  return (
    <div className="chat-mensajes" ref={contenedor}>
      {isPending ? <Cargando />
        : error ? <ErrorMensaje error={error} />
        : data.length === 0 ? <p className="estado">Aún no hay mensajes. ¡Escribe el primero!</p>
        : data.map((m, i) => (
          <BurbujaMensaje key={m.id_mensaje ?? `i${i}`} mensaje={m} propio={m.id_usuario === usuario?.id_usuario} onResponder={onResponder} />
        ))}
    </div>
  );
}
