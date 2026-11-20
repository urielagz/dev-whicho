import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { claves, materiasApi } from "@/features/academico/academico.api";
import { useUsuario } from "@/auth/AuthContext";
import { useMutacion } from "@/lib/useMutacion";
import { formData } from "@/lib/api";
import { nombreCompleto } from "@/lib/formato";
import { Modal } from "@/components/Modal";
import { Cargando, ErrorMensaje, Vacio } from "@/components/Estado";
import type { Materia } from "@/types";

export function NuevaMateriaModal({ abierto, onCerrar, onCreada }: {
  abierto: boolean;
  onCerrar: () => void;
  onCreada: (m: Materia) => void;
}) {
  const usuario = useUsuario();
  const crear = useMutacion((nombre: string) => materiasApi.crear(nombre, usuario.id_usuario), {
    invalidar: [claves.materiasDocente],
    onSuccess: onCreada,
  });

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    crear.mutate(String(new FormData(e.currentTarget).get("nombre")).trim());
  }

  return (
    <Modal abierto={abierto} titulo="Nueva materia" onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="mat-nombre">Nombre de la materia</label>
          <input id="mat-nombre" name="nombre" required placeholder="Ej. Cálculo Integral" />
        </div>
        <button type="submit" className="btn btn-primario" disabled={crear.isPending}>Guardar materia</button>
      </form>
    </Modal>
  );
}

export function EditarMateriaModal({ materia, onCerrar }: { materia: Materia; onCerrar: () => void }) {
  const guardar = useMutacion((fd: FormData) => materiasApi.actualizar(materia.id_materia, fd), {
    invalidar: [claves.materiasDocente],
    exito: "Materia actualizada.",
    onSuccess: onCerrar,
  });

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const icono = d.get("icono") as File | null;
    guardar.mutate(formData({
      nombre: String(d.get("nombre")).trim(),
      color: String(d.get("color")),
      orden: String(d.get("orden")),
      icono: icono && icono.size > 0 ? icono : undefined,
    }));
  }

  return (
    <Modal abierto titulo="Editar materia" onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="edit-mat-nombre">Nombre de la materia</label>
          <input id="edit-mat-nombre" name="nombre" defaultValue={materia.nombre} />
        </div>
        <div className="fila-campos">
          <div className="campo">
            <label htmlFor="edit-mat-color">Color</label>
            <input id="edit-mat-color" name="color" type="color" defaultValue={materia.color || "#00BB77"} />
          </div>
          <div className="campo">
            <label htmlFor="edit-mat-orden">Orden</label>
            <input id="edit-mat-orden" name="orden" type="number" min={0} defaultValue={materia.orden ?? ""} />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="edit-mat-icono">Ícono (opcional)</label>
          <input id="edit-mat-icono" name="icono" type="file" accept="image/*" />
        </div>
        <button type="submit" className="btn btn-primario" disabled={guardar.isPending}>Guardar cambios</button>
      </form>
    </Modal>
  );
}

export function TokenModal({ nombre, token, onCerrar }: { nombre: string; token: string; onCerrar: () => void }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(token);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* sin permiso de portapapeles: el campo queda seleccionable a mano */
    }
  }

  return (
    <Modal abierto titulo="Token de inscripción" onCerrar={onCerrar}>
      <p className="texto-tenue">{nombre}</p>
      <div className="campo">
        <label htmlFor="token-valor">Comparte este token con tus alumnos:</label>
        <input id="token-valor" readOnly value={token} onFocus={e => e.currentTarget.select()} className="input-token" />
      </div>
      <button type="button" className="btn btn-primario" onClick={copiar}>{copiado ? "¡Copiado!" : "Copiar token"}</button>
    </Modal>
  );
}

export function AlumnosModal({ materia, onCerrar }: { materia: Materia; onCerrar: () => void }) {
  const { data, isPending, error } = useQuery({
    queryKey: claves.alumnos(materia.id_materia),
    queryFn: () => materiasApi.alumnos(materia.id_materia),
  });

  return (
    <Modal abierto ancho titulo={`Alumnos de ${materia.nombre}`} onCerrar={onCerrar}>
      {isPending ? <Cargando />
        : error ? <ErrorMensaje error={error} />
        : data.length === 0 ? <Vacio>Todavía no hay alumnos inscritos en esta materia.</Vacio>
        : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Alumno</th><th>Correo</th><th>Avance</th><th>Actividades completadas</th></tr>
              </thead>
              <tbody>
                {data.map(a => (
                  <tr key={a.id_usuario}>
                    <td>{nombreCompleto(a)}</td>
                    <td>{a.correo}</td>
                    <td>{a.progreso ? Number(a.progreso.porcentaje_avance).toFixed(0) : 0}%</td>
                    <td>{a.progreso?.act_completas ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </Modal>
  );
}
