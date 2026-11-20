import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth, useUsuario } from "@/auth/AuthContext";
import { nombreCompleto } from "@/lib/formato";

export interface Pestana {
  ruta: string;
  etiqueta: string;
}

interface Props {
  subtitulo: string;
  pestanas: Pestana[];
  /** Enlace extra a la derecha (p. ej. "Administración" para admins). */
  extra?: { ruta: string; etiqueta: string } | null;
}

/* Barra superior con pestañas-ruta (deep-linkables) y el contenido debajo. */
export function PanelLayout({ subtitulo, pestanas, extra }: Props) {
  const usuario = useUsuario();
  const { cerrarSesion } = useAuth();

  return (
    <div className="panel">
      <header className="panel-navbar">
        <div className="logo">Dev Whicho <span>{subtitulo}</span></div>

        {pestanas.length > 0 && (
          <nav className="pestanas" aria-label="Secciones">
            {pestanas.map(p => (
              <NavLink key={p.ruta} to={p.ruta} className={({ isActive }) => `pestana${isActive ? " activa" : ""}`}>
                {p.etiqueta}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="panel-navbar-derecha">
          {extra && <Link to={extra.ruta} className="btn btn-secundario">{extra.etiqueta}</Link>}
          <span className="usuario-chip">{nombreCompleto(usuario)}</span>
          <button type="button" className="btn btn-secundario" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      <main className="panel-contenido">
        <Outlet />
      </main>
    </div>
  );
}
