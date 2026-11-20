import { useUsuario } from "@/auth/AuthContext";
import { PanelLayout } from "@/components/PanelLayout";

const PESTANAS = [
  { ruta: "materias", etiqueta: "Materias" },
  { ruta: "comunidad", etiqueta: "Comunidad" },
  { ruta: "perfil", etiqueta: "Perfil" },
];

export function DocenteLayout() {
  const usuario = useUsuario();
  const extra = usuario.rol === "admin" ? { ruta: "/admin", etiqueta: "Administración" } : null;
  return <PanelLayout subtitulo="Docente" pestanas={PESTANAS} extra={extra} />;
}
