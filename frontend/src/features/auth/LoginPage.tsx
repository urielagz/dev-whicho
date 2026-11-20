import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { authApi } from "./auth.api";
import { RecuperarModal } from "./RecuperarModal";
import { SolicitudDocenteModal } from "./SolicitudDocenteModal";
import { useAuth } from "@/auth/AuthContext";
import { rutaInicio } from "@/auth/sesion";
import { Alerta } from "@/components/Estado";
import type { Rol } from "@/types";

type Modo = "login" | "registro";
type ModalAbierto = "recuperar" | "docente" | null;

export function LoginPage() {
  const { usuario, iniciarSesion, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  const [modo, setModo] = useState<Modo>("login");
  const [modal, setModal] = useState<ModalAbierto>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Con sesión iniciada no tiene sentido ver el login.
  const destino = usuario ? rutaInicio(usuario.rol) : null;
  if (destino) return <Navigate to={destino} replace />;

  function cambiarModo() {
    setModo(m => (m === "login" ? "registro" : "login"));
    setError("");
    setExito("");
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const datos = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setError("");
    setExito("");
    setEnviando(true);

    try {
      if (modo === "login") {
        const { token, data } = await authApi.login(datos.correo, datos.contrasena);
        const rol = String(data.rol).toLowerCase() as Rol;
        const ruta = rutaInicio(rol);
        if (!token || !ruta) {
          cerrarSesion();
          throw new Error("Tu cuenta no tiene un panel asignado. Contacta al administrador.");
        }
        iniciarSesion({ token, usuario: { ...data, rol } });
        // replace: el login no queda en el historial (el botón "atrás" no vuelve aquí).
        navegar(ruta, { replace: true });
      } else {
        await authApi.registrar({
          nombre: datos.nombre, apellido: datos.apellido, correo: datos.correo, contrasena: datos.contrasena,
        });
        form.reset();
        setModo("login");
        setExito("¡Registro completado! Ya puedes iniciar sesión.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de comunicación con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  const esLogin = modo === "login";

  return (
    <div className="auth">
      <div className="auth-tarjeta">
        <p className="auth-marca">Dev Whicho</p>
        <h1>{esLogin ? "Iniciar sesión" : "Crear cuenta"}</h1>
        <p className="auth-subtitulo">
          {esLogin ? "Ingresa tus credenciales para acceder" : "Regístrate para empezar a usar la plataforma"}
        </p>

        <Alerta tipo="error">{error}</Alerta>
        <Alerta tipo="exito">{exito}</Alerta>

        <form onSubmit={enviar} key={modo}>
          {!esLogin && (
            <div className="grid-2">
              <Campo nombre="nombre" etiqueta="Nombre" placeholder="Tu nombre" autoComplete="given-name" />
              <Campo nombre="apellido" etiqueta="Apellido" placeholder="Tu apellido" autoComplete="family-name" />
            </div>
          )}
          <Campo nombre="correo" etiqueta="Correo electrónico" tipo="email" placeholder="ejemplo@correo.com" autoComplete="email" />
          <Campo
            nombre="contrasena"
            etiqueta="Contraseña"
            tipo="password"
            placeholder="••••••••"
            autoComplete={esLogin ? "current-password" : "new-password"}
            minLength={esLogin ? undefined : 6}
          />
          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
            {enviando ? "Enviando..." : esLogin ? "Ingresar" : "Registrarse"}
          </button>
        </form>

        <div className="auth-pie">
          <button type="button" className="btn-enlace" onClick={cambiarModo}>
            {esLogin ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
          <button type="button" className="btn-enlace" onClick={() => setModal("recuperar")}>¿Olvidaste tu contraseña?</button>
          <button type="button" className="btn-enlace" onClick={() => setModal("docente")}>¿Eres docente? Solicita tu cuenta aquí</button>
        </div>
      </div>

      <RecuperarModal abierto={modal === "recuperar"} onCerrar={() => setModal(null)} />
      <SolicitudDocenteModal abierto={modal === "docente"} onCerrar={() => setModal(null)} />
    </div>
  );
}

interface CampoProps {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
}

function Campo({ nombre, etiqueta, tipo = "text", placeholder, autoComplete, minLength }: CampoProps) {
  const id = `auth-${nombre}`;
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} name={nombre} type={tipo} placeholder={placeholder} autoComplete={autoComplete} minLength={minLength} required />
    </div>
  );
}
