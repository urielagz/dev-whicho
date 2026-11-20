import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  abierto: boolean;
  titulo: ReactNode;
  onCerrar: () => void;
  ancho?: boolean;
  children: ReactNode;
}

/* Modal accesible: se cierra con Esc, con la ×, o haciendo clic fuera. */
export function Modal({ abierto, titulo, onCerrar, ancho, children }: Props) {
  const idTitulo = useId();

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div className="modal" onMouseDown={e => e.target === e.currentTarget && onCerrar()}>
      <div className={`modal-contenido${ancho ? " modal-ancho" : ""}`} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        <h3 id={idTitulo}>{titulo}</h3>
        {children}
      </div>
    </div>,
    document.body,
  );
}
