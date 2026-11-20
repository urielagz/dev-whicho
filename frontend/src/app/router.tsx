import { Navigate, createHashRouter } from "react-router-dom";

import { RutaProtegida } from "@/auth/RutaProtegida";
import { PanelLayout } from "@/components/PanelLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { AdminPage } from "@/features/admin/AdminPage";
import { ChatPanel } from "@/features/chat/ChatPanel";
import { PerfilPage } from "@/features/perfil/PerfilPage";
import { GestorMaterias } from "@/features/docente/GestorMaterias";
import { DocenteLayout } from "@/features/docente/DocenteLayout";
import { DashboardPage } from "@/features/alumno/DashboardPage";
import { EstantePage } from "@/features/alumno/biblioteca/EstantePage";
import { IndicePage } from "@/features/alumno/biblioteca/IndicePage";
import { CategoriaPage } from "@/features/alumno/biblioteca/CategoriaPage";
import { PaginaActividad, PaginaExamen, PaginaExplicacion } from "@/features/alumno/biblioteca/paginas";

/*
 * Hash router: GitHub Pages no tiene fallback a index.html para rutas de
 * una SPA; con "#/" cualquier URL (p. ej. #/alumno/materias/3) se puede
 * recargar o compartir sin dar 404.
 */
export const router = createHashRouter([
  { path: "/login", element: <LoginPage /> },

  {
    element: <RutaProtegida roles={["alumno"]} />,
    children: [{
      path: "/alumno",
      element: <PanelLayout subtitulo="Alumno" pestanas={[
        { ruta: "dashboard", etiqueta: "Dashboard" },
        { ruta: "materias", etiqueta: "Materias" },
        { ruta: "chat", etiqueta: "Chat" },
        { ruta: "perfil", etiqueta: "Perfil" },
      ]} />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <DashboardPage /> },
        { path: "materias", element: <EstantePage /> },
        { path: "materias/:idMateria", element: <IndicePage /> },
        { path: "materias/:idMateria/:categoria", element: <CategoriaPage /> },
        { path: "materias/:idMateria/explicaciones/:idTema", element: <PaginaExplicacion /> },
        { path: "materias/:idMateria/actividades/:idActividad", element: <PaginaActividad /> },
        { path: "materias/:idMateria/examenes/:idExamen", element: <PaginaExamen /> },
        { path: "chat", element: <ChatPanel /> },
        { path: "perfil", element: <PerfilPage /> },
      ],
    }],
  },

  {
    // El admin también puede usar el panel del docente.
    element: <RutaProtegida roles={["docente", "admin"]} />,
    children: [{
      path: "/docente",
      element: <DocenteLayout />,
      children: [
        { index: true, element: <Navigate to="materias" replace /> },
        { path: "materias/:idMateria?", element: <GestorMaterias /> },
        { path: "comunidad", element: <ChatPanel /> },
        { path: "perfil", element: <PerfilPage /> },
      ],
    }],
  },

  {
    element: <RutaProtegida roles={["admin"]} />,
    children: [{
      path: "/admin",
      element: <PanelLayout subtitulo="Admin" pestanas={[]} extra={{ ruta: "/docente/materias", etiqueta: "Ir al panel de materias" }} />,
      children: [{ index: true, element: <AdminPage /> }],
    }],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
], {
  // Comportamiento de React Router v7 desde ya (facilita la migración).
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
