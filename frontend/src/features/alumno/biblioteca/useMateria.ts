import { useQueries, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { actividadesApi, claves, examenesApi, materiasApi, temasApi } from "@/features/academico/academico.api";
import type { Actividad, Examen, Tema } from "@/types";

export type Categoria = "explicaciones" | "actividades" | "examenes";
export const CATEGORIAS: Record<Categoria, { titulo: string; descripcion: string; icono: string }> = {
  explicaciones: { titulo: "Explicaciones", descripcion: "Teoría y contenido de cada tema", icono: "📖" },
  actividades: { titulo: "Actividades", descripcion: "Trabajos para entregar", icono: "📝" },
  examenes: { titulo: "Exámenes", descripcion: "Evaluaciones de la materia", icono: "🎓" },
};

export const esCategoria = (c?: string): c is Categoria => !!c && c in CATEGORIAS;

/** Materia de la URL (:idMateria) y sus temas, desde la caché si ya se pidieron. */
export function useMateriaActual() {
  const idMateria = Number(useParams().idMateria);
  const materias = useQuery({ queryKey: claves.materiasInscritas, queryFn: materiasApi.inscritas });
  const temas = useQuery({ queryKey: claves.temas(idMateria), queryFn: () => temasApi.deMateria(idMateria), enabled: idMateria > 0 });
  const materia = materias.data?.find(m => m.id_materia === idMateria);
  return { idMateria, materia, temas };
}

export type ItemConTema<T> = T & { tema: Tema };

/**
 * No hay endpoint de actividades/exámenes por materia: se juntan los de
 * cada tema (consultas en paralelo, compartidas con el resto de la app).
 */
export function useItemsPorTema<T extends Actividad | Examen>(categoria: "actividades" | "examenes", temas: Tema[] | undefined) {
  const resultados = useQueries({
    queries: (temas ?? []).map(t => ({
      queryKey: categoria === "actividades" ? claves.actividades(t.id_tema) : claves.examenes(t.id_tema),
      queryFn: () => (categoria === "actividades" ? actividadesApi.deTema(t.id_tema) : examenesApi.deTema(t.id_tema)),
    })),
  });

  return {
    cargando: !temas || resultados.some(r => r.isPending),
    error: resultados.find(r => r.error)?.error ?? null,
    items: resultados.flatMap((r, i) => ((r.data ?? []) as T[]).map(item => ({ ...item, tema: temas![i] }))),
  };
}
