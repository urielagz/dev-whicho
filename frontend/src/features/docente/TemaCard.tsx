import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ActividadModal, ContenidoTemaModal, EntregasModal, ExamenModal, RecursoModal, TemaModal } from "./modalesTema";
import { actividadesApi, claves, examenesApi, recursosApi, temasApi } from "@/features/academico/academico.api";
import { useMutacion } from "@/lib/useMutacion";
import { useToast } from "@/components/Toasts";
import type { Actividad, Examen, Recurso, Tema } from "@/types";

type ModalTema =
  | { tipo: "editar" | "contenido" | "recurso" }
  | { tipo: "actividad"; actividad?: Actividad }
  | { tipo: "examen"; examen?: Examen }
  | { tipo: "entregas"; actividad: Actividad }
  | null;

export function TemaCard({ tema }: { tema: Tema }) {
  const [modal, setModal] = useState<ModalTema>(null);
  const cerrar = () => setModal(null);
  const id = tema.id_tema;

  // Las tres consultas van en paralelo; un fallo en una no oculta las demás.
  const recursos = useQuery({ queryKey: claves.recursos(id), queryFn: () => recursosApi.deTema(id) });
  const actividades = useQuery({ queryKey: claves.actividades(id), queryFn: () => actividadesApi.deTema(id) });
  const examenes = useQuery({ queryKey: claves.examenes(id), queryFn: () => examenesApi.deTema(id) });

  const eliminarTema = useMutacion(() => temasApi.eliminar(id), { invalidar: [claves.temas(tema.id_materia)], exito: "Tema eliminado." });

  const cargando = recursos.isPending || actividades.isPending || examenes.isPending;
  const vacio = !cargando && !recursos.data?.length && !actividades.data?.length && !examenes.data?.length;
  const fallo = recursos.error || actividades.error || examenes.error;

  return (
    <article className="tema">
      <header className="tema-cabecera">
        <h3>{tema.nombre}</h3>
        <div className="fila-botones">
          <button type="button" className="btn btn-secundario" onClick={() => setModal({ tipo: "editar" })}>Editar tema</button>
          <button type="button" className="btn btn-secundario" onClick={() => setModal({ tipo: "contenido" })}>Editar contenido</button>
          <button type="button" className="btn btn-secundario" onClick={() => setModal({ tipo: "actividad" })}>Nueva actividad</button>
          <button type="button" className="btn btn-secundario" onClick={() => setModal({ tipo: "examen" })}>Nuevo examen</button>
          <button type="button" className="btn btn-secundario" onClick={() => setModal({ tipo: "recurso" })}>Nuevo recurso</button>
          <button type="button" className="btn btn-peligro" disabled={eliminarTema.isPending}
            onClick={() => window.confirm(`¿Eliminar el tema "${tema.nombre}"? Esta acción no se puede deshacer.`) && eliminarTema.mutate(undefined)}>
            Eliminar tema
          </button>
        </div>
      </header>
      {tema.descripcion && <p>{tema.descripcion}</p>}

      <div className="tema-items">
        {cargando && <div className="item">Cargando...</div>}
        {fallo && <div className="item estado-error">Error al cargar el contenido del tema.</div>}
        {vacio && !fallo && <div className="item">Sin recursos, actividades ni exámenes aún.</div>}
        {actividades.data?.map(a => (
          <ActividadItem key={a.id_actividad} actividad={a}
            onEditar={() => setModal({ tipo: "actividad", actividad: a })}
            onEntregas={() => setModal({ tipo: "entregas", actividad: a })} />
        ))}
        {examenes.data?.map(e => <ExamenItem key={e.id_examen} examen={e} onEditar={() => setModal({ tipo: "examen", examen: e })} />)}
        {recursos.data?.map(r => <RecursoItem key={r.id_recurso} recurso={r} />)}
      </div>

      {modal?.tipo === "editar" && <TemaModal idMateria={tema.id_materia} tema={tema} onCerrar={cerrar} />}
      {modal?.tipo === "contenido" && <ContenidoTemaModal tema={tema} onCerrar={cerrar} />}
      {modal?.tipo === "recurso" && <RecursoModal idTema={id} onCerrar={cerrar} />}
      {modal?.tipo === "actividad" && <ActividadModal idTema={id} actividad={modal.actividad} onCerrar={cerrar} />}
      {modal?.tipo === "examen" && <ExamenModal idTema={id} examen={modal.examen} onCerrar={cerrar} />}
      {modal?.tipo === "entregas" && <EntregasModal actividad={modal.actividad} onCerrar={cerrar} />}
    </article>
  );
}

function ActividadItem({ actividad, onEditar, onEntregas }: { actividad: Actividad; onEditar: () => void; onEntregas: () => void }) {
  const eliminar = useMutacion(() => actividadesApi.eliminar(actividad.id_actividad), {
    invalidar: [claves.actividades(actividad.id_tema)], exito: "Actividad eliminada.",
  });
  return (
    <div className="item">
      <span className="item-tipo">Actividad</span>
      <strong>{actividad.titulo}</strong>
      {actividad.descripcion && <p>{actividad.descripcion}</p>}
      {actividad.archivos_apoyo?.map((a, i) => (
        <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="enlace">{a.nombre_original || "Archivo"}</a>
      ))}
      <div className="fila-botones">
        <button type="button" className="btn-mini" onClick={onEntregas}>Ver entregas</button>
        <button type="button" className="btn-mini" onClick={onEditar}>Editar</button>
        <button type="button" className="btn-mini btn-mini-peligro" disabled={eliminar.isPending}
          onClick={() => window.confirm(`¿Eliminar la actividad "${actividad.titulo}"?`) && eliminar.mutate(undefined)}>Eliminar</button>
      </div>
    </div>
  );
}

function ExamenItem({ examen, onEditar }: { examen: Examen; onEditar: () => void }) {
  const eliminar = useMutacion(() => examenesApi.eliminar(examen.id_examen), {
    invalidar: [claves.examenes(examen.id_tema)], exito: "Examen eliminado.",
  });
  return (
    <div className="item">
      <span className="item-tipo">Examen</span>
      <strong>{examen.titulo}</strong>
      <a href={examen.url_formulario} target="_blank" rel="noopener noreferrer" className="enlace">Abrir examen</a>
      <div className="fila-botones">
        <button type="button" className="btn-mini" onClick={onEditar}>Editar</button>
        <button type="button" className="btn-mini btn-mini-peligro" disabled={eliminar.isPending}
          onClick={() => window.confirm(`¿Eliminar el examen "${examen.titulo}"?`) && eliminar.mutate(undefined)}>Eliminar</button>
      </div>
    </div>
  );
}

function RecursoItem({ recurso }: { recurso: Recurso }) {
  const { avisarError } = useToast();
  const eliminar = useMutacion(() => recursosApi.eliminar(recurso.id_recurso), {
    invalidar: [claves.recursos(recurso.id_tema)], exito: "Recurso eliminado.",
  });
  return (
    <div className="item">
      <span className="item-tipo">Recurso</span>
      <strong>{recurso.titulo}</strong>
      {recurso.descripcion && <p>{recurso.descripcion}</p>}
      {recurso.archivos?.map((a, i) => (
        <button key={i} type="button" className="enlace"
          onClick={() => recursosApi.descargar(recurso.id_recurso, i).catch(avisarError)}>
          {a.nombre_original || "Archivo"}
        </button>
      ))}
      <div className="fila-botones">
        <button type="button" className="btn-mini btn-mini-peligro" disabled={eliminar.isPending}
          onClick={() => window.confirm(`¿Eliminar el recurso "${recurso.titulo}"?`) && eliminar.mutate(undefined)}>Eliminar</button>
      </div>
    </div>
  );
}
