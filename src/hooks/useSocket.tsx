// Hook để sử dụng socket trong React components
"use client";
import * as React from "react";
import type { Socket } from "socket.io-client";
import { useSocketContext } from "@/providers/SocketProvider";

type UseSocketOptions = {
  userId?: string;
  token?: string;
  autoConnect?: boolean;
};

export function useSocket(_opts: UseSocketOptions = {}) {
  const { socket, connected } = useSocketContext();

  // Gửi event tới server
  const emit = React.useCallback(
    (event: string, payload?: any, cb?: (...args: any[]) => void) => {
      if (!socket) return;
      if (typeof cb === "function") return socket.emit(event, payload, cb);
      return socket.emit(event, payload);
    },
    [socket]
  );

  // Lắng nghe event từ server
  const subscribe = React.useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      if (!socket) return () => {};
      socket.on(event, handler);
      return () => socket.off(event, handler);
    },
    [socket]
  );

  return { socket, connected, emit, subscribe } as const;
}

export default useSocket;
