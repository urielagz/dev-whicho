import { Resend } from "resend";
import { env } from "./env";

// Resend manda por HTTPS: Render bloquea el SMTP saliente en el plan gratis.
//
// Sin un dominio propio verificado en Resend, el remitente tiene que ser el
// "sandbox" y solo se puede mandar correo a la cuenta dueña de la API key.
// Con un dominio verificado, define MAIL_FROM="Dev Whicho <algo@tudominio.com>".
//
// El cliente se crea solo si hay RESEND_API_KEY: `new Resend()` sin clave
// lanza una excepción y antes impedía arrancar el servidor en local.
const resend = env.mail.resendApiKey ? new Resend(env.mail.resendApiKey) : null;

if (!resend) {
    console.warn("[mailer] RESEND_API_KEY no definida: los correos se mostrarán en consola en lugar de enviarse.");
}

export interface AdjuntoCorreo {
    filename: string;
    content: Buffer;
}

export async function enviarCorreo(destinatario: string, asunto: string, html: string, adjuntos?: AdjuntoCorreo[]) {
    if (!resend) {
        if (env.esProduccion) throw new Error("El envío de correo no está configurado (RESEND_API_KEY).");
        console.info(`[mailer] (sin enviar) Para: ${destinatario} | Asunto: ${asunto}\n${html}`);
        return;
    }

    const { error } = await resend.emails.send({
        from: env.mail.remitente,
        to: destinatario,
        subject: asunto,
        html,
        attachments: adjuntos?.map(({ filename, content }) => ({ filename, content })),
    });

    if (error) throw new Error(error.message || "Falló el envío del correo con Resend.");
}
