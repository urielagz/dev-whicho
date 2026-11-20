import type { ReactNode } from "react";

/* Estados de carga / vacío / error con el mismo aspecto en toda la app. */

export function Cargando({ texto = "Cargando..." }: { texto?: string }) {
  return <p className="estado">{texto}</p>;
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="estado">{children}</p>;
}

export function ErrorMensaje({ error }: { error: unknown }) {
  const mensaje = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
  return <p className="estado estado-error" role="alert">{mensaje}</p>;
}

export function Alerta({ tipo, children }: { tipo: "error" | "exito"; children: ReactNode }) {
  if (!children) return null;
  return <div className={`alerta alerta-${tipo}`} role={tipo === "error" ? "alert" : "status"}>{children}</div>;
}
