import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { rutaInicio } from "./sesion";
import type { Rol } from "@/types";

/* Deja pasar solo a usuarios con sesión y uno de los roles indicados. */
export function RutaProtegida({ roles }: { roles: Rol[] }) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to={rutaInicio(usuario.rol) ?? "/login"} replace />;

  return <Outlet />;
}
