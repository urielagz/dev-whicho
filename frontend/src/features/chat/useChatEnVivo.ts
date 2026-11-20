import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { config } from "@/config";
import { clavesChat } from "./chat.api";
import type { MensajeChat } from "@/types";

/*
 * Conexión Socket.IO mientras el chat está montado: se une al room del grupo
 * activo y agrega en caché los mensajes que llegan en vivo. El polling de
 * React Query (cada CHAT_POLLING_MS) queda como respaldo si el socket cae.
 */
export function useChatEnVivo(token: string | null, idGrupo: number | null) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    const socket = io(config.API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("chat:mensaje", (msg: MensajeChat) => {
      queryClient.setQueryData<MensajeChat[]>(clavesChat.mensajes(Number(msg.id_grupo)), anteriores => {
        if (!anteriores) return anteriores;
        if (msg.id_mensaje && anteriores.some(m => m.id_mensaje === msg.id_mensaje)) return anteriores;
        return [...anteriores, msg];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, queryClient]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !idGrupo) return;
    const unirse = () => socket.emit("chat:unirse", idGrupo);
    unirse();
    socket.on("connect", unirse); // al reconectar hay que volver a entrar al room
    return () => {
      socket.off("connect", unirse);
      socket.emit("chat:salir", idGrupo);
    };
  }, [idGrupo]);
}
