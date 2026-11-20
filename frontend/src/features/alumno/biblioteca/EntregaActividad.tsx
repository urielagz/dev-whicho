import { useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { actividadesApi, claves } from "@/features/academico/academico.api";
import { useMutacion } from "@/lib/useMutacion";
import { formData } from "@/lib/api";
import { categoriaArchivo, formatearTamano } from "@/lib/formato";
import { useToast } from "@/components/Toasts";
import { Cargando } from "@/components/Estado";
import { config } from "@/config";
import type { Actividad } from "@/types";

/* Muestra la entrega actual del alumno, o el formulario para entregar. */
export function EntregaActividad({ actividad }: { actividad: Actividad }) {
  const misEntregas = useQuery({ queryKey: claves.misEntregas, queryFn: actividadesApi.misEntregas });
  const entrega = misEntregas.data?.find(e => e.id_actividad === actividad.id_actividad);

  const retirar = useMutacion(() => actividadesApi.retirarEntrega(actividad.id_actividad), {
    invalidar: [claves.misEntregas, ["progreso"], ["dashboard"]], exito: "Entrega retirada.",
  });

  if (misEntregas.isPending) return <Cargando />;
  if (!entrega) return <FormularioEntrega actividad={actividad} />;

  const calificado = entrega.calificacion !== null && entrega.calificacion !== undefined;
  return (
    <div className="entrega-actual">
      <strong>{calificado ? `Calificado: ${entrega.calificacion}` : "Ya entregaste esta actividad"}</strong>
      {entrega.comentario_alumno && <p>{entrega.comentario_alumno}</p>}
      {entrega.url_entrega && <p><a href={entrega.url_entrega} target="_blank" rel="noopener noreferrer" className="enlace">{entrega.url_entrega}</a></p>}
      {entrega.archivos?.map((a, i) => (
        <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="enlace">📎 {a.nombre_original || "Archivo"}</a>
      ))}
      {entrega.observaciones_docente && <p><em>{entrega.observaciones_docente}</em></p>}
      {!calificado && (
        <button type="button" className="btn-enlace btn-enlace-peligro" disabled={retirar.isPending}
          onClick={() => window.confirm("¿Retirar tu entrega de esta actividad?") && retirar.mutate(undefined)}>
          Retirar mi entrega
        </button>
      )}
    </div>
  );
}

function FormularioEntrega({ actividad }: { actividad: Actividad }) {
  const { avisar } = useToast();
  const [archivos, setArchivos] = useState<File[]>([]);
  const input = useRef<HTMLInputElement>(null);

  const entregar = useMutacion((fd: FormData) => actividadesApi.entregar(actividad.id_actividad, fd), {
    invalidar: [claves.misEntregas, ["progreso"], ["dashboard"]], exito: "¡Actividad entregada!",
  });

  function agregar(lista: FileList | null) {
    if (!lista) return;
    const nuevos = [...archivos];
    for (const a of Array.from(lista)) {
      if (nuevos.length >= config.MAX_ARCHIVOS) {
        avisar(`Puedes adjuntar como máximo ${config.MAX_ARCHIVOS} archivos.`, "error");
        break;
      }
      nuevos.push(a);
    }
    setArchivos(nuevos);
    if (input.current) input.current.value = "";
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const comentario = String(d.get("comentario")).trim();
    const url = String(d.get("url_entrega")).trim();
    if (!comentario && !url && archivos.length === 0) {
      avisar("Adjunta al menos un archivo, escribe tu entrega en texto o comparte una URL.", "error");
      return;
    }
    entregar.mutate(formData({ comentario, url_entrega: url, archivos }));
  }

  return (
    <form className="form-entrega" onSubmit={enviar}>
      <h3>Entregar actividad</h3>
      <div className="campo">
        <label htmlFor="entrega-comentario">Comentario / respuesta en texto</label>
        <textarea id="entrega-comentario" name="comentario" rows={3} placeholder="Escribe tu respuesta (opcional si adjuntas archivo o URL)" />
      </div>
      <div className="campo">
        <label htmlFor="entrega-url">URL (opcional)</label>
        <input id="entrega-url" name="url_entrega" type="url" placeholder="https://..." />
      </div>
      <div className="campo">
        <span className="etiqueta">Archivos (máx. {config.MAX_ARCHIVOS}, opcional)</span>
        <button type="button" className="btn btn-secundario" onClick={() => input.current?.click()}>+ Adjuntar archivos</button>
        <input ref={input} type="file" multiple hidden onChange={e => agregar(e.target.files)} />
        <div className="archivos">
          {archivos.map((a, i) => {
            const cat = categoriaArchivo(a.name);
            return (
              <div className="archivo" key={`${a.name}-${i}`}>
                <span className={`archivo-insignia archivo-${cat.clase}`}>{cat.etiqueta}</span>
                <div className="archivo-info">
                  <span className="archivo-nombre">{a.name}</span>
                  <span className="texto-tenue">{formatearTamano(a.size)}</span>
                </div>
                <button type="button" className="btn-icono-texto" aria-label={`Quitar ${a.name}`} onClick={() => setArchivos(archivos.filter((_, j) => j !== i))}>×</button>
              </div>
            );
          })}
        </div>
      </div>
      <button type="submit" className="btn btn-primario" disabled={entregar.isPending}>{entregar.isPending ? "Entregando..." : "Entregar"}</button>
    </form>
  );
}
