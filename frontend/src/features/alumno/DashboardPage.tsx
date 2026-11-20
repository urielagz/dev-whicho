import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { api, apiData } from "@/lib/api";
import { useMutacion } from "@/lib/useMutacion";
import { formatearFecha } from "@/lib/formato";
import { Cargando, ErrorMensaje, Vacio } from "@/components/Estado";
import type { EventoCalendario, Notificacion, Recomendados } from "@/types";

const claves = {
  notificaciones: ["dashboard", "notificaciones"] as const,
  calendario: ["dashboard", "calendario"] as const,
  recomendados: ["dashboard", "recomendados"] as const,
};

export function DashboardPage() {
  return (
    <section className="seccion dashboard">
      <Widget titulo="Notificaciones"><Notificaciones /></Widget>
      <Widget titulo="Calendario / próximas fechas"><Calendario /></Widget>
      <Widget titulo="Recomendados para ti" completo><RecomendadosWidget /></Widget>
    </section>
  );
}

function Widget({ titulo, completo, children }: { titulo: string; completo?: boolean; children: ReactNode }) {
  return (
    <div className={`widget${completo ? " widget-completo" : ""}`}>
      <h3>{titulo}</h3>
      {children}
    </div>
  );
}

function Notificaciones() {
  const { data, isPending, error } = useQuery({
    queryKey: claves.notificaciones,
    queryFn: () => apiData<Notificacion[]>("/dashboard/notificaciones"),
  });
  const marcar = useMutacion((id: number) => api(`/dashboard/notificaciones/${id}/leida`, { metodo: "PUT" }), {
    invalidar: [claves.notificaciones],
  });

  if (isPending) return <Cargando />;
  if (error) return <ErrorMensaje error={error} />;
  if (data.length === 0) return <Vacio>No tienes notificaciones.</Vacio>;

  return (
    <div className="widget-lista">
      {data.map((n, i) => {
        const id = n.id_notificacion ?? n.id;
        const pendiente = !n.leida && id !== undefined;
        const contenido = (
          <>
            <strong>{n.titulo || "Notificación"}</strong>
            <span>{n.mensaje}</span>
            <small>{formatearFecha(n.fecha_creacion ?? n.fecha)}</small>
          </>
        );
        return pendiente ? (
          <button key={id} type="button" className="widget-item no-leida" title="Marcar como leída" onClick={() => marcar.mutate(id)}>
            {contenido}
          </button>
        ) : (
          <div key={id ?? i} className="widget-item">{contenido}</div>
        );
      })}
    </div>
  );
}

function Calendario() {
  const navegar = useNavigate();
  const { data, isPending, error } = useQuery({
    queryKey: claves.calendario,
    queryFn: () => apiData<EventoCalendario[]>("/dashboard/calendario"),
  });

  if (isPending) return <Cargando />;
  if (error) return <ErrorMensaje error={error} />;
  if (data.length === 0) return <Vacio>No tienes fechas próximas.</Vacio>;

  return (
    <div className="widget-lista">
      {data.map(ev => {
        const tipo = ev.tipo === "examen" ? "Examen" : ev.tipo === "actividad" ? "Actividad" : "Evento";
        const contenido = (
          <>
            <strong>{ev.titulo || ev.nombre || "Evento"}</strong>
            <span>{tipo}{ev.nombre_materia ? ` · ${ev.nombre_materia}` : ""}</span>
            <small>{formatearFecha(ev.fecha_limite ?? ev.fecha)}</small>
          </>
        );
        // Salta directo a la actividad/examen dentro de su materia.
        const ruta = ev.id_materia && (ev.tipo === "actividad" || ev.tipo === "examen")
          ? `/alumno/materias/${ev.id_materia}/${ev.tipo === "actividad" ? "actividades" : "examenes"}/${ev.id}`
          : null;
        return ruta ? (
          <button key={`${ev.tipo}-${ev.id}`} type="button" className="widget-item" onClick={() => navegar(ruta)}>{contenido}</button>
        ) : (
          <div key={`${ev.tipo}-${ev.id}`} className="widget-item">{contenido}</div>
        );
      })}
    </div>
  );
}

function RecomendadosWidget() {
  const { data, isPending, error } = useQuery({
    queryKey: claves.recomendados,
    queryFn: () => apiData<Recomendados>("/dashboard/recomendados"),
  });

  if (isPending) return <Cargando />;
  if (error) return <ErrorMensaje error={error} />;

  const grupos = [
    { titulo: "A repasar", temas: data.repasar?.temas, actividades: data.repasar?.actividades },
    { titulo: "Siguientes", temas: data.siguientes?.temas, actividades: data.siguientes?.actividades },
  ];

  return (
    <div className="recomendados">
      {grupos.map(g => (
        <div key={g.titulo}>
          <h4 className="recomendados-titulo">{g.titulo}</h4>
          <ListaSimple titulo="Temas" items={g.temas?.map(t => t.nombre)} />
          <ListaSimple titulo="Actividades" items={g.actividades?.map(a => a.titulo)} />
        </div>
      ))}
    </div>
  );
}

function ListaSimple({ titulo, items }: { titulo: string; items?: string[] }) {
  return (
    <div className="recomendados-sub">
      <h5>{titulo}</h5>
      {!items?.length ? <Vacio>Nada por aquí.</Vacio> : (
        <div className="widget-lista">
          {items.map((t, i) => <div key={i} className="widget-item"><strong>{t || "Sin título"}</strong></div>)}
        </div>
      )}
    </div>
  );
}
