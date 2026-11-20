import { api } from "@/lib/api";
import type { Usuario } from "@/types";

export const authApi = {
  login: (correo: string, contrasena: string) =>
    api<Usuario>("/login", { metodo: "POST", cuerpo: { correo, contraseña: contrasena } }),

  registrar: (datos: { nombre: string; apellido: string; correo: string; contrasena: string }) =>
    api<Usuario>("/usuarios", {
      metodo: "POST",
      cuerpo: { nombre: datos.nombre, apellido: datos.apellido, correo: datos.correo, contraseña: datos.contrasena },
    }),

  olvideContrasena: (correo: string) =>
    api<null>("/usuarios/forgot-password", { metodo: "POST", cuerpo: { correo } }),

  restablecer: (token: string, nueva: string) =>
    api<null>("/usuarios/reset-password", { metodo: "POST", cuerpo: { token, nuevaContraseña: nueva } }),

  solicitarCuentaDocente: (fd: FormData) =>
    api<{ id_solicitud: number }>("/docentes/solicitud", { metodo: "POST", cuerpo: fd }),
};
