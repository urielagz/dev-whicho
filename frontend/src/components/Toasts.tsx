import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Tipo = "exito" | "error" | "info";
interface Toast { id: number; tipo: Tipo; mensaje: string }

interface ToastValor {
  avisar: (mensaje: string, tipo?: Tipo) => void;
  avisarError: (error: unknown) => void;
}

const ToastContext = createContext<ToastValor | null>(null);
let siguienteId = 1;

/* Avisos no bloqueantes; reemplazan a los alert() de la versión anterior. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const avisar = useCallback((mensaje: string, tipo: Tipo = "info") => {
    const id = siguienteId++;
    setToasts(t => [...t, { id, tipo, mensaje }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), tipo === "error" ? 6000 : 3500);
  }, []);

  const avisarError = useCallback(
    (error: unknown) => avisar(error instanceof Error ? error.message : "Ocurrió un error inesperado.", "error"),
    [avisar],
  );

  const valor = useMemo(() => ({ avisar, avisarError }), [avisar, avisarError]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.tipo}`} role={t.tipo === "error" ? "alert" : "status"}>
            {t.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValor {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
