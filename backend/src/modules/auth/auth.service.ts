import bcrypt from "bcrypt";

import RepositorioUsuarios from "../usuarios/usuario.repository";
import { Usuario } from "../usuarios/usuario.model";
import { generarJWT } from "../../shared/utils/jwt";
import { generarTokenRecuperacion, validarToken, eliminarToken } from "../../shared/utils/tokensRecuperacion";
import { HttpError } from "../../shared/http/HttpError";
import { enviarCorreo } from "../../config/mailer";

const RONDAS_BCRYPT = 10;

export type UsuarioPublico = Omit<Usuario, "contrasena">;

export function sinContrasena(usuario: Usuario): UsuarioPublico {
    const { contrasena: _omitida, ...publico } = usuario;
    return publico;
}

/*
 * Reglas de autenticación, sin nada de HTTP. Los controladores solo
 * traducen req -> llamada -> res; los errores se lanzan como HttpError.
 */
export const AuthService = {

    async iniciarSesion(correo: string, contrasena: string) {
        const usuario = await RepositorioUsuarios.buscarPorCorreo(correo);
        const coincide = usuario ? await bcrypt.compare(contrasena, usuario.contrasena) : false;

        // Mismo mensaje en ambos casos: no revela qué correos están registrados.
        if (!usuario || !coincide) throw new HttpError(401, "Credenciales incorrectas");

        return { token: generarJWT(usuario.id_usuario, usuario.rol), usuario: sinContrasena(usuario) };
    },

    // El registro público solo crea alumnos; los docentes pasan por
    // /docentes/solicitud y la aprobación de un admin.
    async registrarAlumno(datos: { nombre: string; apellido: string; correo: string; contraseña: string }) {
        if (await RepositorioUsuarios.buscarPorCorreo(datos.correo)) {
            throw HttpError.conflicto("Ya existe una cuenta con ese correo.");
        }
        const hash = await bcrypt.hash(datos.contraseña, RONDAS_BCRYPT);
        const usuario = await RepositorioUsuarios.agregar(datos.nombre, datos.apellido, datos.correo, hash, "alumno");
        return sinContrasena(usuario);
    },

    // Responde igual exista o no el correo, para no permitir enumerar cuentas.
    async solicitarRecuperacion(correo: string) {
        const usuario = await RepositorioUsuarios.buscarPorCorreo(correo);
        if (!usuario) return;

        const codigo = generarTokenRecuperacion(correo);
        try {
            await enviarCorreo(
                correo,
                "Recuperación de contraseña - Dev Whicho",
                `<p>Usa este código para restablecer tu contraseña (caduca en 15 minutos):</p><p><b>${codigo}</b></p>`
            );
        } catch (error) {
            console.error("No se pudo enviar el correo de recuperación:", error);
            eliminarToken(codigo);
            throw new HttpError(502, "No fue posible enviar el correo de recuperación.");
        }
    },

    async restablecerContrasena(codigo: string, nueva: string) {
        const correo = validarToken(codigo);
        if (!correo) throw HttpError.solicitudInvalida("Código inválido o caducado.");

        const usuario = await RepositorioUsuarios.buscarPorCorreo(correo);
        if (!usuario) throw HttpError.noEncontrado("Usuario no encontrado.");

        await RepositorioUsuarios.actualizarContraseña(usuario.id_usuario, await bcrypt.hash(nueva, RONDAS_BCRYPT));
        eliminarToken(codigo);
    },

    async cambiarContrasena(idUsuario: number, actual: string, nueva: string) {
        const usuario = await RepositorioUsuarios.buscarPorId(idUsuario);
        if (!usuario) throw HttpError.noEncontrado("Usuario no encontrado.");

        if (!(await bcrypt.compare(actual, usuario.contrasena))) {
            throw new HttpError(401, "La contraseña actual es incorrecta.");
        }
        await RepositorioUsuarios.actualizarContraseña(idUsuario, await bcrypt.hash(nueva, RONDAS_BCRYPT));
    },
};
