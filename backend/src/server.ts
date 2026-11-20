import { env } from "./config/env";   // primero: carga y valida las variables de entorno
import { pool } from "./config/database";

import http from "http";
import app from "./app";
import { iniciarSocket } from "./modules/chat/chat.socket";

// Se envuelve app en un http.Server explícito para colgarle Socket.IO
// (el chat en tiempo real) en el mismo puerto que la API REST.
const servidorHttp = http.createServer(app);
iniciarSocket(servidorHttp);

servidorHttp.listen(env.PORT, () => {
    console.log(`${env.APP_NAME} ejecutándose en puerto ${env.PORT}`);
});

// Cierre ordenado (Render manda SIGTERM en cada redeploy).
function cerrar(senal: string) {
    console.log(`${senal} recibido, cerrando servidor...`);
    servidorHttp.close(() => {
        pool.end().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => cerrar("SIGTERM"));
process.on("SIGINT", () => cerrar("SIGINT"));

process.on("unhandledRejection", (motivo) => {
    console.error("Promesa rechazada sin manejar:", motivo);
});
