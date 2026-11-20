import { z } from "zod";
import { campos } from "../../shared/http/validar";

// Los nombres de campo ("contraseña", "nuevaContraseña") se conservan por
// compatibilidad con los clientes existentes y la colección de Postman.

export const esquemaLogin = z.object({
    correo: campos.correo,
    contraseña: z.string({ required_error: "La contraseña es obligatoria." }).min(1, "La contraseña es obligatoria."),
});

export const esquemaRegistro = z.object({
    nombre: campos.texto("El nombre"),
    apellido: campos.texto("El apellido"),
    correo: campos.correo,
    contraseña: campos.contrasena,
});

export const esquemaOlvide = z.object({
    correo: campos.correo,
});

export const esquemaRestablecer = z.object({
    token: campos.texto("El código"),
    nuevaContraseña: campos.contrasena,
});

export const esquemaCambiarContrasena = z.object({
    contraseñaActual: z.string().min(1, "La contraseña actual es obligatoria."),
    nuevaContraseña: campos.contrasena,
});
