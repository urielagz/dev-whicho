import { z } from "zod";
import { campos } from "../../shared/http/validar";

// Llegan como multipart (todo string) o JSON: z.coerce normaliza números.
// Un string vacío en un campo opcional se trata como "no enviado".
const vacioAUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

const color = z.preprocess(vacioAUndefined, z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido (usa #RRGGBB).").optional());
const orden = z.preprocess(vacioAUndefined, z.coerce.number().int().min(0).optional());
const icono = z.preprocess(vacioAUndefined, z.string().url().optional());
const idDocente = z.preprocess(vacioAUndefined, campos.id.optional());

export const esquemaCrearMateria = z.object({
    nombre: campos.texto("El nombre"),
    color,
    orden,
    icono,
    id_docente: idDocente,
});

export const esquemaActualizarMateria = z.object({
    nombre: z.preprocess(vacioAUndefined, z.string().trim().min(1).optional()),
    color,
    orden,
    icono,
});

export const esquemaInscripcion = z.object({
    token: z.string({ required_error: "Debes ingresar el token de la materia." })
        .trim().min(1, "Debes ingresar el token de la materia.").toUpperCase(),
});

export const esquemaAviso = z.object({
    titulo: campos.texto("El título"),
    mensaje: campos.texto("El mensaje"),
});
