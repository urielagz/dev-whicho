import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { borrarSesion, guardarSesion, leerSesion, type Sesion } from "./sesion";
import { EVENTO_SESION_EXPIRADA } from "@/lib/api";
import type { Usuario } from "@/types";

interface AuthValor {
  usuario: Usuario | null;
  token: string | null;
  iniciarSesion: (sesion: Sesion) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);
  const queryClient = useQueryClient();

  const iniciarSesion = useCallback((nueva: Sesion) => {
    guardarSesion(nueva);
    setSesion(nueva);
  }, []);

  const cerrarSesion = useCallback(() => {
    borrarSesion();
    queryClient.clear(); // que el siguiente usuario no vea datos en caché del anterior
    setSesion(null);
  }, [queryClient]);

  // Si el backend rechaza el token (expirado o inválido), se cierra la sesión.
  useEffect(() => {
    window.addEventListener(EVENTO_SESION_EXPIRADA, cerrarSesion);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, cerrarSesion);
  }, [cerrarSesion]);

  const valor = useMemo<AuthValor>(
    () => ({ usuario: sesion?.usuario ?? null, token: sesion?.token ?? null, iniciarSesion, cerrarSesion }),
    [sesion, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValor {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

/** Para pantallas que ya están detrás de <RutaProtegida>: el usuario existe. */
export function useUsuario(): Usuario {
  const { usuario } = useAuth();
  if (!usuario) throw new Error("useUsuario requiere sesión iniciada");
  return usuario;
}
