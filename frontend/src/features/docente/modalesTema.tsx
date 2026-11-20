import { useQuery } from "@tanstack/react-query";
import type { FormEvent } from "react";

import { actividadesApi, claves, examenesApi, recursosApi, temasApi } from "@/features/academico/academico.api";
import { useMutacion } from "@/lib/useMutacion";
import { formData } from "@/lib/api";
import { fechaParaInput, formatearFechaLarga, nombreCompleto } from "@/lib/formato";
import { Modal } from "@/components/Modal";
import { Cargando, ErrorMensaje, Vacio } from "@/components/Estado";
import type { Actividad, Entrega, Examen, Tema } from "@/types";

const ACEPTA_APOYO = ".pdf,.doc,.docx,.png,.jpg";

/** Lee un formulario como objeto de strings (sin archivos). */
const leer = (e: FormEvent<HTMLFormElement>) =>
  Object.fromEntries([...new FormData(e.currentTarget)].filter(([, v]) => typeof v === "string").map(([k, v]) => [k, String(v).trim()]));

const archivosDe = (e: FormEvent<HTMLFormElement>, campo: string) =>
  (new FormData(e.currentTarget).getAll(campo) as File[]).filter(f => f.size > 0);

const primerArchivo = (e: FormEvent<HTMLFormElement>, campo: string) => archivosDe(e, campo)[0];

// ===================== Tema (crear / editar metadatos) =====================
export function TemaModal({ idMateria, tema, onCerrar }: { idMateria: number; tema?: Tema; onCerrar: () => void }) {
  const guardar = useMutacion(
    (d: { nombre: string; descripcion: string }) =>
      tema ? temasApi.actualizar(tema.id_tema, d) : temasApi.crear({ ...d, id_materia: idMateria }),
    { invalidar: [claves.temas(idMateria)], exito: tema ? "Tema actualizado." : "Tema creado.", onSuccess: onCerrar },
  );

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = leer(e);
    guardar.mutate({ nombre: d.nombre, descripcion: d.descripcion });
  }

  return (
    <Modal abierto titulo={tema ? "Editar tema" : "Nuevo tema"} onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="tema-nombre">Nombre del tema</label>
          <input id="tema-nombre" name="nombre" required defaultValue={tema?.nombre} placeholder="Ej. Integración por sustitución" />
        </div>
        <div className="campo">
          <label htmlFor="tema-desc">Descripción</label>
          <textarea id="tema-desc" name="descripcion" rows={3} required={Boolean(tema)} defaultValue={tema?.descripcion ?? ""} placeholder="Breve descripción del tema" />
        </div>
        <button type="submit" className="btn btn-primario" disabled={guardar.isPending}>{tema ? "Guardar cambios" : "Guardar tema"}</button>
      </form>
    </Modal>
  );
}

// ===================== Contenido del tema (lo que lee el alumno) =====================
export function ContenidoTemaModal({ tema, onCerrar }: { tema: Tema; onCerrar: () => void }) {
  const guardar = useMutacion((fd: FormData) => temasApi.actualizarContenido(tema.id_tema, fd), {
    invalidar: [claves.temas(tema.id_materia)], exito: "Contenido guardado.", onSuccess: onCerrar,
  });

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = leer(e);
    const fd = formData({ imagen1: primerArchivo(e, "imagen1"), imagen2: primerArchivo(e, "imagen2") });
    // Introducción y contenido se envían aunque estén vacíos (permite borrarlos).
    fd.append("introduccion", d.introduccion);
    fd.append("contenido", d.contenido);
    guardar.mutate(fd);
  }

  return (
    <Modal abierto titulo="Editar contenido del tema" onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="cont-intro">Introducción</label>
          <textarea id="cont-intro" name="introduccion" rows={2} defaultValue={tema.introduccion ?? ""} />
        </div>
        <div className="campo">
          <label htmlFor="cont-texto">Contenido</label>
          <textarea id="cont-texto" name="contenido" rows={6} defaultValue={tema.contenido ?? ""} />
        </div>
        <div className="campo">
          <label htmlFor="cont-img1">Imagen 1 (opcional, reemplaza la actual)</label>
          <input id="cont-img1" name="imagen1" type="file" accept="image/*" />
        </div>
        <div className="campo">
          <label htmlFor="cont-img2">Imagen 2 (opcional, reemplaza la actual)</label>
          <input id="cont-img2" name="imagen2" type="file" accept="image/*" />
        </div>
        <button type="submit" className="btn btn-primario" disabled={guardar.isPending}>Guardar contenido</button>
      </form>
    </Modal>
  );
}

// ===================== Recurso (teoría) =====================
export function RecursoModal({ idTema, onCerrar }: { idTema: number; onCerrar: () => void }) {
  const crear = useMutacion(recursosApi.crear, { invalidar: [claves.recursos(idTema)], exito: "Recurso publicado.", onSuccess: onCerrar });

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = leer(e);
    crear.mutate(formData({ titulo: d.titulo, descripcion: d.descripcion, id_tema: idTema, archivos: archivosDe(e, "archivos") }));
  }

  return (
    <Modal abierto titulo="Publicar recurso (teoría)" onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="rec-titulo">Título del recurso</label>
          <input id="rec-titulo" name="titulo" required />
        </div>
        <div className="campo">
          <label htmlFor="rec-desc">Descripción</label>
          <textarea id="rec-desc" name="descripcion" rows={3} />
        </div>
        <div className="campo">
          <label htmlFor="rec-archivos">Adjuntar archivos (máx. 5)</label>
          <input id="rec-archivos" name="archivos" type="file" multiple accept={ACEPTA_APOYO} />
        </div>
        <button type="submit" className="btn btn-primario" disabled={crear.isPending}>{crear.isPending ? "Subiendo..." : "Subir recurso"}</button>
      </form>
    </Modal>
  );
}

// ===================== Actividad (crear / editar) =====================
export function ActividadModal({ idTema, actividad, onCerrar }: { idTema: number; actividad?: Actividad; onCerrar: () => void }) {
  const guardar = useMutacion(
    (fd: FormData) => (actividad ? actividadesApi.actualizar(actividad.id_actividad, fd) : actividadesApi.crear(fd)),
    { invalidar: [claves.actividades(idTema)], exito: actividad ? "Actividad actualizada." : "Actividad creada.", onSuccess: onCerrar },
  );

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = leer(e);
    const fd = formData({
      titulo: d.titulo,
      fecha_limite: d.fecha_limite,
      puntaje: d.puntaje,
      archivos_permitidos: d.archivos_permitidos,
      id_tema: actividad ? undefined : idTema,
      archivos_apoyo: archivosDe(e, "archivos_apoyo"),
    });
    fd.append("descripcion", d.descripcion);
    guardar.mutate(fd);
  }

  return (
    <Modal abierto titulo={actividad ? "Editar actividad" : "Nueva actividad"} onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="act-titulo">Título de la actividad</label>
          <input id="act-titulo" name="titulo" required defaultValue={actividad?.titulo} />
        </div>
        <div className="campo">
          <label htmlFor="act-desc">Descripción</label>
          <textarea id="act-desc" name="descripcion" rows={3} defaultValue={actividad?.descripcion ?? ""} />
        </div>
        <div className="fila-campos">
          <div className="campo">
            <label htmlFor="act-fecha">Fecha límite</label>
            <input id="act-fecha" name="fecha_limite" type="datetime-local" defaultValue={fechaParaInput(actividad?.fecha_limite)} />
          </div>
          <div className="campo">
            <label htmlFor="act-puntaje">Puntaje</label>
            <input id="act-puntaje" name="puntaje" type="number" min={0} defaultValue={actividad?.puntaje ?? ""} />
          </div>
        </div>
        {actividad && (
          <div className="campo">
            <label htmlFor="act-permitidos">Extensiones permitidas (opcional)</label>
            <input id="act-permitidos" name="archivos_permitidos" placeholder="Ej. .pdf,.doc,.docx" defaultValue={actividad.archivos_permitidos ?? ""} />
          </div>
        )}
        <div className="campo">
          <label htmlFor="act-archivos">{actividad ? "Agregar archivos de apoyo (se suman a los existentes)" : "Adjuntar archivos (máx. 5)"}</label>
          <input id="act-archivos" name="archivos_apoyo" type="file" multiple accept={ACEPTA_APOYO} />
        </div>
        <button type="submit" className="btn btn-primario" disabled={guardar.isPending}>{actividad ? "Guardar cambios" : "Guardar actividad"}</button>
      </form>
    </Modal>
  );
}

// ===================== Examen (crear / editar) =====================
export function ExamenModal({ idTema, examen, onCerrar }: { idTema: number; examen?: Examen; onCerrar: () => void }) {
  const guardar = useMutacion(
    (d: Partial<Examen>) => (examen ? examenesApi.actualizar(examen.id_examen, d) : examenesApi.crear({ ...d, id_tema: idTema })),
    { invalidar: [claves.examenes(idTema)], exito: examen ? "Examen actualizado." : "Examen creado.", onSuccess: onCerrar },
  );

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = leer(e);
    guardar.mutate({
      titulo: d.titulo,
      url_formulario: d.url_formulario,
      descripcion: d.descripcion,
      ...(d.fecha_limite ? { fecha_limite: d.fecha_limite } : {}),
    });
  }

  return (
    <Modal abierto titulo={examen ? "Editar examen" : "Crear examen"} onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="ex-titulo">Título del examen</label>
          <input id="ex-titulo" name="titulo" required defaultValue={examen?.titulo} />
        </div>
        <div className="campo">
          <label htmlFor="ex-url">URL del formulario</label>
          <input id="ex-url" name="url_formulario" type="url" required placeholder="https://forms.gle/..." defaultValue={examen?.url_formulario} />
        </div>
        <div className="campo">
          <label htmlFor="ex-desc">Instrucciones</label>
          <textarea id="ex-desc" name="descripcion" rows={3} defaultValue={examen?.descripcion ?? ""} />
        </div>
        <div className="campo">
          <label htmlFor="ex-fecha">Fecha límite</label>
          <input id="ex-fecha" name="fecha_limite" type="datetime-local" defaultValue={fechaParaInput(examen?.fecha_limite)} />
        </div>
        <button type="submit" className="btn btn-primario" disabled={guardar.isPending}>{examen ? "Guardar cambios" : "Crear examen"}</button>
      </form>
    </Modal>
  );
}

// ===================== Entregas de una actividad (calificar) =====================
export function EntregasModal({ actividad, onCerrar }: { actividad: Actividad; onCerrar: () => void }) {
  const { data, isPending, error } = useQuery({
    queryKey: claves.entregas(actividad.id_actividad),
    queryFn: () => actividadesApi.entregas(actividad.id_actividad),
  });

  return (
    <Modal abierto ancho titulo={`Entregas: ${actividad.titulo}`} onCerrar={onCerrar}>
      {isPending ? <Cargando />
        : error ? <ErrorMensaje error={error} />
        : data.length === 0 ? <Vacio>Nadie ha entregado esta actividad todavía.</Vacio>
        : <div className="lista">{data.map(en => <EntregaItem key={en.id_registro} entrega={en} actividad={actividad} />)}</div>}
    </Modal>
  );
}

function EntregaItem({ entrega, actividad }: { entrega: Entrega; actividad: Actividad }) {
  const maximo = actividad.puntaje ?? undefined;
  const calificar = useMutacion(
    (d: { calificacion: number; observaciones: string }) => actividadesApi.calificar(entrega.id_registro, d.calificacion, d.observaciones),
    { invalidar: [claves.entregas(actividad.id_actividad)], exito: "Calificación guardada." },
  );

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = leer(e);
    calificar.mutate({ calificacion: Number(d.calificacion), observaciones: d.observaciones });
  }

  return (
    <div className="entrega">
      <div className="entrega-cabecera">
        <strong>{nombreCompleto(entrega)}</strong>
        <span>{formatearFechaLarga(entrega.fecha_entrega)}</span>
      </div>
      {entrega.comentario_alumno && <p>{entrega.comentario_alumno}</p>}
      {entrega.url_entrega && (
        <p><a href={entrega.url_entrega} target="_blank" rel="noopener noreferrer" className="enlace">{entrega.url_entrega}</a></p>
      )}
      {!!entrega.archivos?.length && (
        <div className="entrega-archivos">
          {entrega.archivos.map((a, i) => <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" download>{a.nombre_original || "Archivo"}</a>)}
        </div>
      )}
      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor={`cal-${entrega.id_registro}`}>Calificación{maximo ? ` (de ${maximo})` : ""}</label>
          <input id={`cal-${entrega.id_registro}`} name="calificacion" type="number" step="0.01" min={0} max={maximo} required defaultValue={entrega.calificacion ?? ""} />
        </div>
        <div className="campo">
          <label htmlFor={`obs-${entrega.id_registro}`}>Observaciones (opcional)</label>
          <textarea id={`obs-${entrega.id_registro}`} name="observaciones" rows={2} defaultValue={entrega.observaciones_docente ?? ""} />
        </div>
        <button type="submit" className="btn btn-primario" disabled={calificar.isPending}>Guardar calificación</button>
      </form>
    </div>
  );
}
