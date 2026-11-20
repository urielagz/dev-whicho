import { useQuery } from "@tanstack/react-query";

import { apiData } from "@/lib/api";
import { formatearFecha, iniciales, nombreCompleto } from "@/lib/formato";
import { useUsuario } from "@/auth/AuthContext";
import { Cargando, ErrorMensaje, Vacio } from "@/components/Estado";
import type { MateriaConProgreso, Usuario } from "@/types";

/* Perfil compartido; el alumno además ve su progreso por materia. */
export function PerfilPage() {
  const usuario = useUsuario();

  // Si falla la consulta se muestran los datos guardados en la sesión.
  const { data } = useQuery({
    queryKey: ["usuarios", usuario.id_usuario],
    queryFn: () => apiData<Usuario>(`/usuarios/${usuario.id_usuario}`),
  });
  const perfil = data ?? usuario;

  return (
    <section className="seccion">
      <div className="perfil">
        {perfil.foto_perfil
          ? <img src={perfil.foto_perfil} alt="" className="perfil-avatar" />
          : <div className="perfil-avatar" aria-hidden="true">{iniciales(perfil)}</div>}
        <h2>{nombreCompleto(perfil)}</h2>
        <p className="perfil-correo">{perfil.correo}</p>
        <dl className="perfil-datos">
          <div><dt>ID de usuario</dt><dd>{perfil.id_usuario}</dd></div>
          <div><dt>Biografía</dt><dd>{perfil.biografia || "Sin biografía"}</dd></div>
          {perfil.fecha_registro && <div><dt>Miembro desde</dt><dd>{formatearFecha(perfil.fecha_registro)}</dd></div>}
        </dl>
      </div>
      {usuario.rol === "alumno" && <MiProgreso />}
    </section>
  );
}

function MiProgreso() {
  const { data, isPending, error } = useQuery({
    queryKey: ["progreso", "mio"],
    queryFn: () => apiData<MateriaConProgreso[]>("/progreso/mi-progreso"),
  });

  return (
    <div className="perfil progreso">
      <h3>Mi progreso</h3>
      {isPending ? <Cargando texto="Cargando progreso..." />
        : error ? <ErrorMensaje error={error} />
        : data.length === 0 ? <Vacio>Todavía no estás inscrito en ninguna materia.</Vacio>
        : data.map(m => {
          const porcentaje = Math.max(0, Math.min(100, Number(m.progreso?.porcentaje_avance) || 0));
          const completadas = m.progreso?.act_completas ?? 0;
          return (
            <div className="progreso-materia" key={m.id_materia}>
              <div className="progreso-cabecera"><span>{m.nombre}</span><strong>{porcentaje}%</strong></div>
              <div className="progreso-barra" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} aria-label={m.nombre}>
                <div style={{ width: `${porcentaje}%`, background: m.color || "var(--primario)" }} />
              </div>
              <span className="texto-tenue">
                {completadas} {completadas === 1 ? "actividad completada" : "actividades completadas"}
              </span>
            </div>
          );
        })}
    </div>
  );
}
