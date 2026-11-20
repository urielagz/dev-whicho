import { useState, type FormEvent } from "react";

import { authApi } from "./auth.api";
import { Modal } from "@/components/Modal";
import { Alerta } from "@/components/Estado";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const ACEPTA = ".pdf,.png,.jpg,.jpeg";

/* Solicitud de cuenta docente: multipart porque exige cédula + diploma. */
export function SolicitudDocenteModal({ abierto, onCerrar }: Props) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  function cerrar() {
    setError("");
    setExito("");
    onCerrar();
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    setExito("");
    setEnviando(true);
    try {
      // Los "name" del formulario coinciden con los campos que espera el backend.
      const r = await authApi.solicitarCuentaDocente(new FormData(form));
      setExito(r.mensaje ?? "Solicitud enviada correctamente.");
      form.reset();
      setTimeout(cerrar, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal abierto={abierto} titulo="Solicitud de cuenta docente" onCerrar={cerrar}>
      <p className="texto-tenue">
        Sube tu cédula profesional y tu diploma. Un administrador revisará tu solicitud y te avisaremos por correo.
      </p>
      <Alerta tipo="error">{error}</Alerta>
      <Alerta tipo="exito">{exito}</Alerta>

      <form onSubmit={enviar}>
        <div className="grid-2">
          <div className="campo">
            <label htmlFor="docente-nombre">Nombre</label>
            <input id="docente-nombre" name="nombre" required placeholder="Tu nombre" />
          </div>
          <div className="campo">
            <label htmlFor="docente-apellido">Apellido</label>
            <input id="docente-apellido" name="apellido" required placeholder="Tu apellido" />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="docente-correo">Correo electrónico</label>
          <input id="docente-correo" name="correo" type="email" required placeholder="ejemplo@correo.com" />
        </div>
        <div className="campo">
          <label htmlFor="docente-cedula">Cédula profesional (PDF o imagen)</label>
          <input id="docente-cedula" name="cedula_profesional" type="file" required accept={ACEPTA} />
        </div>
        <div className="campo">
          <label htmlFor="docente-diploma">Diploma (PDF o imagen)</label>
          <input id="docente-diploma" name="diploma" type="file" required accept={ACEPTA} />
        </div>
        <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar solicitud"}
        </button>
      </form>
    </Modal>
  );
}
