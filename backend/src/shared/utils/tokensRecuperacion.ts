import crypto from "crypto";

// Códigos de recuperación de contraseña en memoria.
// - Se generan con crypto (antes Math.random, que no es seguro).
// - Caducan a los 15 minutos.
// Nota: al vivir en memoria se pierden si el servidor se reinicia; para
// varias instancias habría que moverlos a una tabla de la BD.
const DURACION_MS = 15 * 60 * 1000;

const tokens = new Map<string, { correo: string; expira: number }>();

function limpiarExpirados(): void {
    const ahora = Date.now();
    for (const [token, datos] of tokens) {
        if (datos.expira <= ahora) tokens.delete(token);
    }
}

export function generarTokenRecuperacion(correo: string): string {
    limpiarExpirados();

    const token = crypto.randomBytes(5).toString("hex"); // 10 caracteres

    tokens.set(token, { correo, expira: Date.now() + DURACION_MS });

    return token;
}

export function validarToken(token: string): string | undefined {
    const datos = tokens.get(token);

    if (!datos) return undefined;

    if (datos.expira <= Date.now()) {
        tokens.delete(token);
        return undefined;
    }

    return datos.correo;
}

export function eliminarToken(token: string): void {
    tokens.delete(token);
}
