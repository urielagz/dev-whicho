import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TemaCard } from "./TemaCard";
import { AlumnosModal } from "./modalesMateria";
import { TemaModal } from "./modalesTema";
import { claves, temasApi } from "@/features/academico/academico.api";
import { Cargando, ErrorMensaje, Vacio } from "@/components/Estado";
import type { Materia } from "@/types";

export function VistaMateria({ materia, onEditar }: { materia: Materia; onEditar: () => void }) {
  const [modal, setModal] = useState<"tema" | "alumnos" | null>(null);
  const temas = useQuery({ queryKey: claves.temas(materia.id_materia), queryFn: () => temasApi.deMateria(materia.id_materia) });

  return (
    <>
      <header className="materia-cabecera">
        <h2>{materia.nombre}</h2>
        <div className="fila-botones">
          <button type="button" className="btn btn-secundario" onClick={onEditar}>Editar materia</button>
          <button type="button" className="btn btn-secundario" onClick={() => setModal("alumnos")}>Ver alumnos</button>
          <button type="button" className="btn btn-primario" onClick={() => setModal("tema")}>+ Nuevo tema</button>
        </div>
      </header>

      {temas.isPending ? <Cargando />
        : temas.error ? <ErrorMensaje error={temas.error} />
        : temas.data.length === 0 ? <Vacio>Aún no hay temas en esta materia.</Vacio>
        : temas.data.map(t => <TemaCard key={t.id_tema} tema={t} />)}

      {modal === "tema" && <TemaModal idMateria={materia.id_materia} onCerrar={() => setModal(null)} />}
      {modal === "alumnos" && <AlumnosModal materia={materia} onCerrar={() => setModal(null)} />}
    </>
  );
}
