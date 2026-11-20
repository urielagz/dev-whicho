import { config } from "@/config";
import { leerToken } from "@/auth/sesion";

/*
 * Cliente HTTP único de la app. Todas las llamadas al backend pasan por aquí:
 *  - agrega el JWT (Authorization: Bearer) si hay sesión,
 *  - serializa JSON o envía FormData tal cual (multipart),
 *  - convierte cualquier fallo en ApiError con el mensaje del backend,
 *  - avisa con el evento "sesion:expirada" si el backend responde 401.
 */

export class ApiError extends Error {
  constructor(public readonly status: number, mensaje: string) {
    super(mensaje);
    this.name = "ApiError";
  }
}

export interface Respuesta<T> {
  ok: boolean;
  mensaje?: string;
  data: T;
  token?: string;
  total?: number;
}

type Metodo = "GET" | "POST" | "PUT" | "DELETE";

interface Opciones {
  metodo?: Metodo;
  cuerpo?: unknown;
  signal?: AbortSignal;
}

export const EVENTO_SESION_EXPIRADA = "sesion:expirada";

async function solicitar(ruta: string, { metodo = "GET", cuerpo, signal }: Opciones = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  const token = leerToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (cuerpo instanceof FormData) {
    body = cuerpo;
  } else if (cuerpo !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(cuerpo);
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${config.API_URL}${ruta}`, { method: metodo, headers, body, signal });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión.");
  }

  if (respuesta.status === 401 && token) {
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
  }
  return respuesta;
}

/** Petición JSON. Devuelve el sobre completo { ok, data, mensaje, ... }. */
export async function api<T>(ruta: string, opciones?: Opciones): Promise<Respuesta<T>> {
  const respuesta = await solicitar(ruta, opciones);
  const esJson = (respuesta.headers.get("content-type") ?? "").includes("application/json");

  if (!esJson) {
    throw new ApiError(respuesta.status, `La ruta ${ruta} no devolvió JSON (status ${respuesta.status}).`);
  }
  const json = (await respuesta.json()) as Respuesta<T>;
  if (!respuesta.ok || !json.ok) {
    throw new ApiError(respuesta.status, json.mensaje || `Error del servidor (${respuesta.status}).`);
  }
  return json;
}

/** Atajo cuando solo interesa `data`. */
export async function apiData<T>(ruta: string, opciones?: Opciones): Promise<T> {
  return (await api<T>(ruta, opciones)).data;
}

/** Descarga un archivo protegido con JWT (no se puede usar un <a href> normal). */
export async function descargarArchivo(ruta: string, nombrePorDefecto = "archivo"): Promise<void> {
  const respuesta = await solicitar(ruta);
  if (!respuesta.ok) throw new ApiError(respuesta.status, "No se pudo descargar el archivo.");

  const blob = await respuesta.blob();
  const nombre = respuesta.headers.get("content-disposition")?.match(/filename="?([^"]+)"?/)?.[1];
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre ? decodeURIComponent(nombre) : nombrePorDefecto;
  enlace.click();
  URL.revokeObjectURL(url);
}

/** Construye FormData omitiendo valores vacíos; los File[] se agregan uno por uno. */
export function formData(campos: Record<string, string | number | Blob | Blob[] | null | undefined>): FormData {
  const fd = new FormData();
  for (const [clave, valor] of Object.entries(campos)) {
    if (valor === undefined || valor === null || valor === "") continue;
    if (Array.isArray(valor)) valor.forEach(v => fd.append(clave, v));
    else fd.append(clave, valor instanceof Blob ? valor : String(valor));
  }
  return fd;
}
