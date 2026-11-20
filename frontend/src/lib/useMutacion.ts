import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useToast } from "@/components/Toasts";

interface Opciones<R> {
  /** Consultas a refrescar cuando la mutación termina bien. */
  invalidar?: QueryKey[];
  /** Mensaje de éxito (texto fijo o calculado con la respuesta). */
  exito?: string | ((resultado: R) => string | undefined);
  onSuccess?: (resultado: R) => void;
}

/*
 * useMutation con el comportamiento común de la app: muestra el error en un
 * toast, refresca las consultas afectadas y opcionalmente avisa del éxito.
 * `isPending` sirve para deshabilitar el botón y evitar envíos dobles.
 */
export function useMutacion<V, R = unknown>(fn: (variables: V) => Promise<R>, opciones: Opciones<R> = {}) {
  const queryClient = useQueryClient();
  const { avisar, avisarError } = useToast();

  return useMutation({
    mutationFn: fn,
    onError: avisarError,
    onSuccess: async resultado => {
      await Promise.all((opciones.invalidar ?? []).map(queryKey => queryClient.invalidateQueries({ queryKey })));
      const mensaje = typeof opciones.exito === "function" ? opciones.exito(resultado) : opciones.exito;
      if (mensaje) avisar(mensaje, "exito");
      opciones.onSuccess?.(resultado);
    },
  });
}
