import { Link } from "react-router-dom";
import type { ReactNode } from "react";

/* Botón con forma de separador de libro para subir un nivel. */
export function Volver({ a, children = "Volver" }: { a: string; children?: ReactNode }) {
  return <Link to={a} className="separador">← {children}</Link>;
}
