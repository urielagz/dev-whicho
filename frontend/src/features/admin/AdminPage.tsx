import { useQuery } from "@tanstack/react-query";

import { apiData, api } from "@/lib/api";
import { useMutacion } from "@/lib/useMutacion";
import { formatearFechaLarga, nombreCompleto } from "@/lib/formato";
import { Cargando, ErrorMensaje, Vacio } from "@/components/Estado";
import { useToast } from "@/components/Toasts";
import type { SolicitudDocente } from "@/types";

const CLAVE = ["docentes", "pendientes"] as const;

export function AdminPage() {
  const { data, isPending, error } = useQuery({
    queryKey: CLAVE,
    queryFn: () => apiData<SolicitudDocente[]>("/docentes/pendientes"),
  });

  return (
    <section className="seccion">
      <h2 className="seccion-titulo">Solicitudes de docentes</h2>
      {isPending ? <Cargando /> : error ? <ErrorMensaje error={error} />
        : data.length === 0 ? <Vacio>No hay solicitudes de docentes pendientes.</Vacio>
        : data.map(s => <SolicitudItem key={s.id_solicitud} solicitud={s} />)}
    </section>
  );
}

function SolicitudItem({ solicitud }: { solicitud: SolicitudDocente }) {
  const { avisar } = useToast();
  const decidir = useMutacion(
    (accion: "aprobar" | "rechazar") => api(`/docentes/${solicitud.id_solicitud}/${accion}`, { metodo: "POST" }),
    { invalidar: [CLAVE], exito: r => r.mensaje },
  );

  function confirmar(accion: "aprobar" | "rechazar") {
    if (window.confirm(accion === "aprobar" ? "¿Aprobar esta solicitud de docente?" : "¿Rechazar esta solicitud de docente?")) {
      decidir.mutate(accion);
    }
  }

  function ver(url?: string | null) {
    if (url) window.open(url, "_blank", "noopener");
    else avisar("Este archivo no está disponible.", "error");
  }

  return (
    <article className="tarjeta">
      <strong>{nombreCompleto(solicitud)}</strong>
      <p>{solicitud.correo}</p>
      <p className="texto-tenue">Solicitado: {formatearFechaLarga(solicitud.fecha_solicitud)}</p>
      <div className="fila-botones">
        <button type="button" className="btn btn-secundario" onClick={() => ver(solicitud.cedula_profesional)}>Ver cédula profesional</button>
        <button type="button" className="btn btn-secundario" onClick={() => ver(solicitud.diploma)}>Ver diploma</button>
      </div>
      <div className="fila-botones">
        <button type="button" className="btn btn-primario" disabled={decidir.isPending} onClick={() => confirmar("aprobar")}>Aprobar</button>
        <button type="button" className="btn btn-peligro" disabled={decidir.isPending} onClick={() => confirmar("rechazar")}>Rechazar</button>
      </div>
    </article>
  );
}
