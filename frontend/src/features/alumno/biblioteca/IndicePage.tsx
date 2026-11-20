import { Link } from "react-router-dom";

import { CATEGORIAS, useMateriaActual, type Categoria } from "./useMateria";
import { Volver } from "./Volver";

export function IndicePage() {
  const { idMateria, materia } = useMateriaActual();

  return (
    <section className="seccion">
      <Volver a="/alumno/materias">Volver al estante</Volver>
      <h2 className="seccion-titulo">{materia?.nombre ?? "Materia"}</h2>
      <div className="categorias">
        {(Object.keys(CATEGORIAS) as Categoria[]).map(c => (
          <Link key={c} to={`/alumno/materias/${idMateria}/${c}`} className="categoria">
            <span className="categoria-icono" aria-hidden="true">{CATEGORIAS[c].icono}</span>
            <h3>{CATEGORIAS[c].titulo}</h3>
            <p>{CATEGORIAS[c].descripcion}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
