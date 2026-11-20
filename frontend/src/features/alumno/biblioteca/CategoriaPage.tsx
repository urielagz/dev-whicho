import { Link, Navigate, useParams } from "react-router-dom";

import { CATEGORIAS, esCategoria, useItemsPorTema, useMateriaActual } from "./useMateria";
import { Volver } from "./Volver";
import { formatearFecha, truncar } from "@/lib/formato";
import { Cargando, ErrorMensaje, Vacio } from "@/components/Estado";
import type { Actividad, Examen } from "@/types";

export function CategoriaPage() {
  const { categoria } = useParams();
  const { idMateria, temas } = useMateriaActual();
  const base = `/alumno/materias/${idMateria}`;

  if (!esCategoria(categoria)) return <Navigate to={base} replace />;

  return (
    <section className="seccion">
      <Volver a={base}>Volver al índice</Volver>
      <h2 className="seccion-titulo">{CATEGORIAS[categoria].titulo}</h2>
      {temas.isPending ? <Cargando />
        : temas.error ? <ErrorMensaje error={temas.error} />
        : categoria === "explicaciones" ? (
          temas.data.length === 0 ? <Vacio>Todavía no hay explicaciones en esta materia.</Vacio> : (
            <div className="lista">
              {temas.data.map(t => (
                <Link key={t.id_tema} to={`${base}/explicaciones/${t.id_tema}`} className="tarjeta-enlace">
                  <h4>{t.nombre}</h4>
                  <p>{truncar(t.descripcion || "Sin descripción.", 120)}</p>
                </Link>
              ))}
            </div>
          )
        ) : (
          <ListaEvaluables categoria={categoria} base={base} temas={temas.data} />
        )}
    </section>
  );
}

function ListaEvaluables({ categoria, base, temas }: {
  categoria: "actividades" | "examenes";
  base: string;
  temas: Parameters<typeof useItemsPorTema>[1];
}) {
  const { items, cargando, error } = useItemsPorTema<Actividad | Examen>(categoria, temas);

  if (cargando) return <Cargando />;
  if (error) return <ErrorMensaje error={error} />;
  if (items.length === 0) return <Vacio>Todavía no hay {CATEGORIAS[categoria].titulo.toLowerCase()} en esta materia.</Vacio>;

  return (
    <div className="lista">
      {items.map(item => {
        const id = "id_actividad" in item ? item.id_actividad : item.id_examen;
        return (
          <Link key={id} to={`${base}/${categoria}/${id}`} className="tarjeta-enlace">
            <span className="item-tipo">{item.tema.nombre}</span>
            <h4>{item.titulo}</h4>
            {item.fecha_limite && <p>Fecha límite: {formatearFecha(item.fecha_limite)}</p>}
          </Link>
        );
      })}
    </div>
  );
}
