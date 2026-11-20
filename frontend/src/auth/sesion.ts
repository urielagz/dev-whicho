import type { Rol, Usuario } from "@/types";

// Persistencia de la sesión. Se conservan las claves "token" y "user" de la
// versión anterior para que quien ya tenía sesión no tenga que volver a entrar.
const CLAVE_TOKEN = "token";
const CLAVE_USUARIO = "user";

export interface Sesion {
  token: string;
  usuario: Usuario;
}

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function leerToken(): string | null {
  return leer(CLAVE_TOKEN);
}

export function leerSesion(): Sesion | null {
  const token = leer(CLAVE_TOKEN);
  const crudo = leer(CLAVE_USUARIO);
  if (!token || !crudo) return null;
  try {
    const usuario = JSON.parse(crudo) as Usuario;
    return { token, usuario: { ...usuario, rol: String(usuario.rol).toLowerCase() as Rol } };
  } catch {
    return null;
  }
}

export function guardarSesion({ token, usuario }: Sesion): void {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    /* almacenamiento bloqueado: la sesión vive solo en memoria */
  }
}

export function borrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
  } catch {
    /* nada que borrar */
  }
}

/** Ruta de inicio de cada rol; null si el rol no tiene panel. */
export function rutaInicio(rol: string): string | null {
  switch (rol) {
    case "alumno": return "/alumno";
    case "docente": return "/docente";
    case "admin": return "/admin";
    default: return null;
  }
}
