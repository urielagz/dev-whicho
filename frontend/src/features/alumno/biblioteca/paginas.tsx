import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useMateriaActual } from "./useMateria";
import { Volver } from "./Volver";
import { EntregaActividad } from "./EntregaActividad";
import { actividadesApi, claves, examenesApi, recursosApi } from "@/features/academico/academico.api";
import { formatearFecha } from "@/lib/formato";
import { useToast } from "@/components/Toasts";
import { Cargando, ErrorMensaje } from "@/components/Estado";

// ===================== Explicación (contenido de un tema) =====================
export function PaginaExplicacion() {
  const { idMateria, temas } = useMateriaActual();
  const idTema = Number(useParams().idTema);
  const tema = temas.data?.find(t => t.id_tema === idTema);
  const recursos = useQuery({ queryKey: claves.recursos(idTema), queryFn: () => recursosApi.deTema(idTema) });
  const { avisarError } = useToast();

  return (
    <section className="seccion">
      <Volver a={`/alumno/materias/${idMateria}/explicaciones`} />
      {temas.isPending ? <Cargando /> : temas.error ? <ErrorMensaje error={temas.error} /> : !tema ? (
        <p className="estado">Ese tema no existe.</p>
      ) : (
        <article className="pagina">
          <h2>{tema.nombre}</h2>
          {tema.introduccion && <div className="pagina-texto">{tema.introduccion}</div>}
          {[tema.imagen1, tema.imagen2].filter(Boolean).map((src, i) => <img key={i} src={src!} alt="" />)}
          {tema.contenido && <div className="pagina-texto">{tema.contenido}</div>}
          {!tema.introduccion && !tema.contenido && <p className="pagina-texto">Tu docente todavía no agregó contenido para este tema.</p>}

          {!!recursos.data?.length && (
            <>
              <h3>Recursos</h3>
              {recursos.data.map(r => (
                <div className="recurso" key={r.id_recurso}>
                  <strong>{r.titulo}</strong>
                  {r.descripcion && <p>{r.descripcion}</p>}
                  {r.archivos?.map((a, i) => (
                    <button key={i} type="button" className="enlace" onClick={() => recursosApi.descargar(r.id_recurso, i).catch(avisarError)}>
                      {a.nombre_original || "Archivo"}
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}
        </article>
      )}
    </section>
  );
}

// ===================== Examen =====================
export function PaginaExamen() {
  const { idMateria } = useMateriaActual();
  const idExamen = Number(useParams().idExamen);
  const { data: examen, isPending, error } = useQuery({ queryKey: claves.examen(idExamen), queryFn: () => examenesApi.porId(idExamen) });

  return (
    <section className="seccion">
      <Volver a={`/alumno/materias/${idMateria}/examenes`} />
      {isPending ? <Cargando /> : error ? <ErrorMensaje error={error} /> : (
        <article className="pagina">
          <h2>{examen.titulo}</h2>
          <div className="pagina-meta">{examen.fecha_limite ? `Fecha límite: ${formatearFecha(examen.fecha_limite)}` : "Sin fecha límite"}</div>
          {examen.descripcion && <div className="pagina-texto">{examen.descripcion}</div>}
          <a href={examen.url_formulario} target="_blank" rel="noopener noreferrer" className="btn btn-primario">Abrir examen</a>
        </article>
      )}
    </section>
  );
}

// ===================== Actividad (+ entrega) =====================
export function PaginaActividad() {
  const { idMateria } = useMateriaActual();
  const idActividad = Number(useParams().idActividad);
  const { data: actividad, isPending, error } = useQuery({
    queryKey: claves.actividad(idActividad),
    queryFn: () => actividadesApi.porId(idActividad),
  });

  return (
    <section className="seccion">
      <Volver a={`/alumno/materias/${idMateria}/actividades`} />
      {isPending ? <Cargando /> : error ? <ErrorMensaje error={error} /> : (
        <article className="pagina">
          <h2>{actividad.titulo}</h2>
          <div className="pagina-meta">
            {actividad.fecha_limite ? `Fecha límite: ${formatearFecha(actividad.fecha_limite)}` : "Sin fecha límite"}
            {actividad.puntaje != null && ` · Puntaje: ${actividad.puntaje}`}
          </div>
          {actividad.descripcion && <div className="pagina-texto">{actividad.descripcion}</div>}
          {!!actividad.archivos_apoyo?.length && (
            <div className="pagina-archivos">
              {actividad.archivos_apoyo.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="enlace">📎 {a.nombre_original || "Archivo"}</a>
              ))}
            </div>
          )}
          <EntregaActividad actividad={actividad} />
        </article>
      )}
    </section>
  );
}
