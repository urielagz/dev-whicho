import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { FormEvent } from "react";

import { claves, materiasApi } from "@/features/academico/academico.api";
import { useMutacion } from "@/lib/useMutacion";
import { Cargando, ErrorMensaje } from "@/components/Estado";

/*
 * Estante de materias inscritas. Antes se pedían TODAS las materias y luego
 * una petición por cada una para saber si el alumno estaba inscrito; ahora
 * el backend lo resuelve con GET /materias/inscritas.
 */
export function EstantePage() {
  const materias = useQuery({ queryKey: claves.materiasInscritas, queryFn: materiasApi.inscritas });

  const inscribirse = useMutacion((token: string) => materiasApi.inscribirse(token), {
    invalidar: [claves.materiasInscritas, ["progreso"], ["chats"]],
    exito: r => r.mensaje ?? "Te inscribiste correctamente.",
  });

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const token = String(new FormData(form).get("token")).trim();
    if (token) inscribirse.mutate(token, { onSuccess: () => form.reset() });
  }

  return (
    <section className="seccion">
      <form className="inscripcion" onSubmit={enviar}>
        <label htmlFor="token-materia" className="solo-lectores">Token de la materia</label>
        <input id="token-materia" name="token" placeholder="Ingresa el token de tu materia" autoComplete="off" required />
        <button type="submit" className="btn btn-primario" disabled={inscribirse.isPending}>Unirse</button>
      </form>

      {materias.isPending ? <Cargando texto="Cargando tus materias..." />
        : materias.error ? <ErrorMensaje error={materias.error} />
        : materias.data.length === 0 ? (
          <p className="estado">Aún no estás inscrito en ninguna materia. Usa el token que te compartió tu docente para unirte.</p>
        ) : (
          <>
            <p className="estante-titulo">Tus materias</p>
            <div className="estante">
              {materias.data.map(m => (
                <Link key={m.id_materia} to={`/alumno/materias/${m.id_materia}`} className="libro" style={{ background: m.color || "#00BB77" }}>
                  {m.icono ? <img src={m.icono} alt="" className="libro-icono-img" /> : <span className="libro-icono" aria-hidden="true">📘</span>}
                  <span>{m.nombre}</span>
                </Link>
              ))}
            </div>
          </>
        )}
    </section>
  );
}
