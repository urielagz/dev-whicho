import { useState, type FormEvent } from "react";

import { authApi } from "./auth.api";
import { Modal } from "@/components/Modal";
import { Alerta } from "@/components/Estado";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

/* Dos pasos: 1) pedir el código por correo, 2) código + contraseña nueva. */
export function RecuperarModal({ abierto, onCerrar }: Props) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  function cerrar() {
    setPaso(1);
    setError("");
    setExito("");
    onCerrar();
  }

  async function ejecutar(accion: () => Promise<void>) {
    setError("");
    setExito("");
    setEnviando(true);
    try {
      await accion();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
    } finally {
      setEnviando(false);
    }
  }

  const pedirCodigo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const correo = String(new FormData(e.currentTarget).get("correo"));
    return ejecutar(async () => {
      const r = await authApi.olvideContrasena(correo);
      setExito(r.mensaje ?? "Revisa tu correo, te enviamos un código.");
      setPaso(2);
    });
  };

  const restablecer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    return ejecutar(async () => {
      await authApi.restablecer(String(datos.get("token")), String(datos.get("nueva")));
      setExito("Contraseña actualizada. Ya puedes iniciar sesión.");
      setTimeout(cerrar, 1800);
    });
  };

  return (
    <Modal abierto={abierto} titulo="Recuperar contraseña" onCerrar={cerrar}>
      <Alerta tipo="error">{error}</Alerta>
      <Alerta tipo="exito">{exito}</Alerta>

      {paso === 1 ? (
        <form onSubmit={pedirCodigo}>
          <div className="campo">
            <label htmlFor="olvide-correo">Correo electrónico</label>
            <input id="olvide-correo" name="correo" type="email" required placeholder="ejemplo@correo.com" autoComplete="email" />
          </div>
          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>Enviar código</button>
        </form>
      ) : (
        <form onSubmit={restablecer}>
          <div className="campo">
            <label htmlFor="olvide-token">Código recibido por correo</label>
            <input id="olvide-token" name="token" required placeholder="Código" autoComplete="one-time-code" />
          </div>
          <div className="campo">
            <label htmlFor="olvide-nueva">Nueva contraseña</label>
            <input id="olvide-nueva" name="nueva" type="password" required minLength={6} placeholder="••••••••" autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>Restablecer contraseña</button>
        </form>
      )}
    </Modal>
  );
}
