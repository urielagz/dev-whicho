import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import { env } from "./config/env";
import rutas from "./routes";
import { manejadorErrores, noEncontrado } from "./shared/middlewares/errores";

const app = express();

// Render (y casi cualquier PaaS) pone un proxy delante: sin esto todas las
// peticiones parecen venir de la misma IP y el rate limit no sirve.
app.set("trust proxy", 1);

// ---------- Middlewares globales ----------
// crossOriginResourcePolicy: el frontend vive en otro origen (GitHub Pages)
// y descarga archivos de /uploads y de /recursos/:id/descargar.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.corsOrigenes }));
app.use(express.json({ limit: "1mb" }));
// En Express 5 req.body es undefined si la petición no trae cuerpo; los
// controladores desestructuran req.body, así que se normaliza a {}.
app.use((req, _res, next) => { req.body ??= {}; next(); });

// ---------- Salud (para Render / monitoreo) ----------
app.get("/health", (_req, res) => {
    res.json({ ok: true, app: env.APP_NAME, entorno: env.NODE_ENV });
});

// ---------- Archivos locales heredados ----------
// Los archivos nuevos se suben a Cloudinary; esto solo sirve los que
// pudieran quedar en disco de versiones anteriores.
app.use("/uploads", express.static(path.resolve(env.UPLOADS_PATH)));

// ---------- API (módulos registrados en routes.ts) ----------
app.use(rutas);

// ---------- Errores ----------
app.use(noEncontrado);
app.use(manejadorErrores);

export default app;
