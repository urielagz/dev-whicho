import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import { VistaMateria } from "./VistaMateria";
import { EditarMateriaModal, NuevaMateriaModal, TokenModal } from "./modalesMateria";
import { claves, materiasApi } from "@/features/academico/academico.api";
import { useMutacion } from "@/lib/useMutacion";
import { useToast } from "@/components/Toasts";
import { Cargando, ErrorMensaje } from "@/components/Estado";
import type { Materia } from "@/types";

type ModalMateria =
  | { tipo: "nueva" }
  | { tipo: "editar"; materia: Materia }
  | { tipo: "token"; nombre: string; token: string }
  | null;

/* Barra lateral de materias + la materia seleccionada (/docente/materias/:idMateria). */
export function GestorMaterias() {
  const { idMateria } = useParams();
  const navegar = useNavigate();
  const { avisarError } = useToast();
  const [modal, setModal] = useState<ModalMateria>(null);

  const materias = useQuery({ queryKey: claves.materiasDocente, queryFn: materiasApi.delDocente });
  const seleccionada = materias.data?.find(m => m.id_materia === Number(idMateria)) ?? null;

  const eliminar = useMutacion((m: Materia) => materiasApi.eliminar(m.id_materia), {
    invalidar: [claves.materiasDocente],
    exito: "Materia eliminada.",
    onSuccess: () => navegar("/docente/materias"),
  });

  async function verToken(m: Materia) {
    try {
      setModal({ tipo: "token", nombre: m.nombre, token: await materiasApi.token(m.id_materia) });
    } catch (error) {
      avisarError(error);
    }
  }

  function confirmarEliminar(m: Materia) {
    if (window.confirm(`¿Eliminar la materia "${m.nombre}"? Esta acción no se puede deshacer.`)) eliminar.mutate(m);
  }

  return (
    <div className="gestor">
      <aside className="gestor-lateral">
        <div className="gestor-lateral-cabecera">
          <h3>Mis materias</h3>
          <button type="button" className="btn-redondo" title="Crear materia" aria-label="Crear materia" onClick={() => setModal({ tipo: "nueva" })}>+</button>
        </div>
        {materias.isPending ? <Cargando />
          : materias.error ? <ErrorMensaje error={materias.error} />
          : materias.data.length === 0 ? <p className="estado">Aún no tienes materias.</p>
          : (
            <ul className="gestor-lista">
              {materias.data.map(m => (
                <li key={m.id_materia}>
                  <NavLink to={`/docente/materias/${m.id_materia}`} className={({ isActive }) => (isActive ? "activa" : "")}>
                    {m.nombre}
                  </NavLink>
                  <div className="gestor-acciones">
                    <button type="button" className="btn-mini" onClick={() => verToken(m)}>Token</button>
                    <button type="button" className="btn-mini" onClick={() => setModal({ tipo: "editar", materia: m })}>Editar</button>
                    <button type="button" className="btn-mini btn-mini-peligro" onClick={() => confirmarEliminar(m)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </aside>

      <div className="gestor-principal">
        {seleccionada ? (
          <VistaMateria materia={seleccionada} onEditar={() => setModal({ tipo: "editar", materia: seleccionada })} />
        ) : idMateria && materias.isSuccess ? (
          <p className="estado">Esa materia no existe o no es tuya.</p>
        ) : (
          <div className="bienvenida">
            <h2>¡Bienvenido al panel de gestión académica!</h2>
            <p>Selecciona una materia de la barra lateral o crea una nueva para estructurar tus temas, teoría y evaluaciones.</p>
          </div>
        )}
      </div>

      <NuevaMateriaModal
        abierto={modal?.tipo === "nueva"}
        onCerrar={() => setModal(null)}
        onCreada={m => {
          navegar(`/docente/materias/${m.id_materia}`);
          setModal(m.token ? { tipo: "token", nombre: m.nombre, token: m.token } : null);
        }}
      />
      {modal?.tipo === "editar" && <EditarMateriaModal materia={modal.materia} onCerrar={() => setModal(null)} />}
      {modal?.tipo === "token" && <TokenModal nombre={modal.nombre} token={modal.token} onCerrar={() => setModal(null)} />}
    </div>
  );
}
