import { Request, Response } from "express";
import { MateriaService } from "./materia.service";

/*
 * Capa HTTP de Materia: lee req, llama al servicio y responde. La
 * validación ocurre antes (materia.schemas.ts vía validar()) y los errores
 * los lanza el servicio como HttpError; no hay try/catch aquí.
 */
const id = (res: Response): number => res.locals.params.id;

export const MateriaController = {

    async obtenerTodas(_req: Request, res: Response) {
        const materias = await MateriaService.listar();
        res.json({ ok: true, total: materias.length, data: materias });
    },

    async obtenerPorId(_req: Request, res: Response) {
        res.json({ ok: true, data: await MateriaService.obtener(id(res)) });
    },

    async obtenerPorDocente(req: Request, res: Response) {
        const materias = await MateriaService.listarDelDocente(req.usuario!.id);
        res.json({ ok: true, total: materias.length, data: materias });
    },

    async obtenerInscritas(req: Request, res: Response) {
        const materias = await MateriaService.listarInscritas(req.usuario!.id);
        res.json({ ok: true, total: materias.length, data: materias });
    },

    async crear(req: Request, res: Response) {
        const materia = await MateriaService.crear(req.usuario!, req.body, req.file);
        res.status(201).json({
            ok: true,
            mensaje: "Materia creada correctamente. Se envió el token de inscripción al correo del docente.",
            data: materia,
        });
    },

    async actualizar(req: Request, res: Response) {
        const materia = await MateriaService.actualizar(req.usuario!, id(res), req.body, req.file);
        res.json({ ok: true, mensaje: "Materia actualizada.", data: materia });
    },

    async eliminar(req: Request, res: Response) {
        await MateriaService.eliminar(req.usuario!, id(res));
        res.json({ ok: true, mensaje: "Materia eliminada." });
    },

    async obtenerAlumnos(req: Request, res: Response) {
        const alumnos = await MateriaService.alumnosConProgreso(req.usuario!, id(res));
        res.json({ ok: true, total: alumnos.length, data: alumnos });
    },

    async obtenerIndice(req: Request, res: Response) {
        res.json({ ok: true, data: await MateriaService.indice(req.usuario!, id(res)) });
    },

    async obtenerToken(req: Request, res: Response) {
        res.json({ ok: true, data: { token: await MateriaService.token(req.usuario!, id(res)) } });
    },

    async inscribirse(req: Request, res: Response) {
        const materia = await MateriaService.inscribir(req.usuario!.id, req.body.token);
        res.status(201).json({ ok: true, mensaje: `Te inscribiste correctamente a "${materia.nombre}".`, data: materia });
    },

    async avisoImportante(req: Request, res: Response) {
        await MateriaService.enviarAviso(req.usuario!, id(res), req.body.titulo, req.body.mensaje);
        res.status(201).json({ ok: true, mensaje: "Aviso enviado a todos los alumnos inscritos (notificación y correo)." });
    },
};
