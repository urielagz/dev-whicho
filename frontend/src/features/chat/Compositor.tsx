import { useEffect, useRef, useState, type FormEvent } from "react";

import { chatApi, clavesChat, componerConCita } from "./chat.api";
import { useMutacion } from "@/lib/useMutacion";
import { useToast } from "@/components/Toasts";
import { config } from "@/config";

export interface Cita {
  autor: string;
  fragmento: string;
}

interface Props {
  idGrupo: number;
  cita: Cita | null;
  onQuitarCita: () => void;
}

const TIPOS = [
  { tipo: "foto", etiqueta: "Fotos", acepta: "image/*" },
  { tipo: "video", etiqueta: "Video", acepta: "video/*" },
  { tipo: "documento", etiqueta: "Documento", acepta: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" },
] as const;

/* Caja de texto + adjuntos (menú tipo WhatsApp) + barra de "respondiendo a". */
export function Compositor({ idGrupo, cita, onQuitarCita }: Props) {
  const { avisar } = useToast();
  const [texto, setTexto] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [aceptaActual, setAceptaActual] = useState("");
  const inputArchivo = useRef<HTMLInputElement>(null);
  const inputTexto = useRef<HTMLInputElement>(null);
  const envoltorioMenu = useRef<HTMLDivElement>(null);

  const enviar = useMutacion(
    () => {
      const hayTexto = texto.trim().length > 0;
      const contenido = hayTexto || cita ? componerConCita(texto.trim(), cita) : undefined;
      return chatApi.enviar(idGrupo, contenido, archivos);
    },
    {
      invalidar: [clavesChat.mensajes(idGrupo)],
      onSuccess: () => {
        setTexto("");
        setArchivos([]);
        onQuitarCita();
      },
    },
  );

  useEffect(() => { if (cita) inputTexto.current?.focus(); }, [cita]);

  // Cierra el menú de adjuntar al hacer clic fuera.
  useEffect(() => {
    if (!menuAbierto) return;
    const fuera = (e: MouseEvent) => {
      if (!envoltorioMenu.current?.contains(e.target as Node)) setMenuAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [menuAbierto]);

  function elegirTipo(acepta: string) {
    setAceptaActual(acepta);
    setMenuAbierto(false);
    // Se espera a que React aplique el "accept" antes de abrir el selector.
    requestAnimationFrame(() => inputArchivo.current?.click());
  }

  function agregar(lista: FileList | null) {
    if (!lista) return;
    const nuevos = [...archivos];
    for (const archivo of Array.from(lista)) {
      if (nuevos.length >= config.MAX_ARCHIVOS) {
        avisar(`Solo puedes adjuntar hasta ${config.MAX_ARCHIVOS} archivos por mensaje.`, "error");
        break;
      }
      nuevos.push(archivo);
    }
    setArchivos(nuevos);
    if (inputArchivo.current) inputArchivo.current.value = ""; // permite volver a elegir el mismo archivo
  }

  function alEnviar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim() && archivos.length === 0) return;
    enviar.mutate(undefined);
  }

  return (
    <>
      {cita && (
        <div className="chat-respuesta">
          <div className="chat-respuesta-info">
            <strong>{cita.autor}</strong>
            <span>{cita.fragmento}</span>
          </div>
          <button type="button" className="btn-icono-texto" title="Cancelar respuesta" aria-label="Cancelar respuesta" onClick={onQuitarCita}>×</button>
        </div>
      )}

      {archivos.length > 0 && (
        <div className="chat-adjuntos">
          {archivos.map((a, i) => (
            <div className="chip" key={`${a.name}-${i}`}>
              <span>{a.name}</span>
              <button type="button" aria-label={`Quitar ${a.name}`} onClick={() => setArchivos(archivos.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>
      )}

      <form className="chat-formulario" onSubmit={alEnviar}>
        <div className="chat-adjuntar" ref={envoltorioMenu}>
          <button type="button" className="chat-adjuntar-btn" title="Adjuntar" aria-label="Adjuntar archivo"
            aria-expanded={menuAbierto} onClick={() => setMenuAbierto(a => !a)}>📎</button>
          {menuAbierto && (
            <div className="chat-adjuntar-menu" role="menu">
              {TIPOS.map(t => (
                <button key={t.tipo} type="button" role="menuitem" onClick={() => elegirTipo(t.acepta)}>{t.etiqueta}</button>
              ))}
            </div>
          )}
        </div>
        <input ref={inputArchivo} type="file" multiple accept={aceptaActual} hidden onChange={e => agregar(e.target.files)} />
        <input ref={inputTexto} type="text" value={texto} onChange={e => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..." autoComplete="off" aria-label="Mensaje" />
        <button type="submit" className="btn btn-primario" disabled={enviar.isPending}>Enviar</button>
      </form>
    </>
  );
}
