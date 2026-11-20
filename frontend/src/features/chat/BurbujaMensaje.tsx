import { autorDe, separarCita } from "./chat.api";
import type { Cita } from "./Compositor";
import { formatearFecha, truncar } from "@/lib/formato";
import type { MensajeChat } from "@/types";

interface Props {
  mensaje: MensajeChat;
  propio: boolean;
  onResponder: (cita: Cita) => void;
}

export function BurbujaMensaje({ mensaje, propio, onResponder }: Props) {
  const autor = autorDe(mensaje);
  const { cita, texto } = separarCita(mensaje.contenido);
  const archivos = mensaje.archivos ?? [];
  const fecha = formatearFecha(mensaje.fecha_creacion ?? mensaje.fecha);

  function responder() {
    const fragmento = texto ? truncar(texto) : archivos.length ? "Archivo adjunto" : "";
    onResponder({ autor, fragmento });
  }

  return (
    <div className={`burbuja${propio ? " burbuja-propia" : ""}`}>
      <button type="button" className="burbuja-responder" title="Responder" aria-label={`Responder a ${autor}`} onClick={responder}>↩</button>
      <div className="burbuja-autor">{autor}</div>
      {cita && <div className="burbuja-cita">{cita}</div>}
      {texto && <div className="burbuja-texto">{texto}</div>}
      {archivos.map((a, i) => (
        <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="burbuja-archivo">
          📎 {a.nombre_original || "Archivo adjunto"}
        </a>
      ))}
      {fecha && <div className="burbuja-fecha">{fecha}</div>}
    </div>
  );
}
