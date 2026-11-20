// Prueba manual del envío de correo con Resend.
// Uso:  npm run probar:correo
import { env } from "../config/env";
import { enviarCorreo } from "../config/mailer";

async function probar() {
    if (!env.mail.adminEmail) {
        console.error("❌ Define ADMIN_EMAIL en el .env antes de probar.");
        process.exit(1);
    }

    try {
        // Sin dominio verificado en Resend, solo se puede mandar a la
        // cuenta con la que te registraste ahí -- por eso ADMIN_EMAIL.
        await enviarCorreo(
            env.mail.adminEmail,
            `Prueba de Resend - ${env.APP_NAME}`,
            "<p>Si recibiste esto, la integración con Resend funciona correctamente.</p>"
        );
        console.log("✅ Correo enviado correctamente. Revisa tu bandeja de entrada.");
    } catch (error) {
        console.error("❌ Error al enviar correo:", error);
        process.exit(1);
    }
}

probar();
