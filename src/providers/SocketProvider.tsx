"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  createSocketConnection,
  closeSocket,
  getSocket,
} from "@/lib/socketClient";
import type { Socket } from "socket.io-client";

type SocketCtx = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketCtx>({
  socket: null,
  connected: false,
});

// ✅ ĐÚNG TÊN hook theo code của bạn đang dùng
export function useSocketContext() {
  return useContext(SocketContext);
}

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((s: RootState) => s.auth.user);

  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string>("");
  const [sock, setSock] = useState<Socket | null>(null);

  // đọc token client-only
  useEffect(() => {
    try {
      const t =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") || ""
          : "";
      setToken(t);
    } catch {
      setToken("");
    }
  }, [user?._id]);

  useEffect(() => {
    // chưa login => đóng socket
    if (!user?._id) {
      closeSocket();
      setSock(null);
      setConnected(false);
      return;
    }

    // tạo (hoặc reuse) socket
    const s = createSocketConnection({
      userId: String(user._id),
      token,
      autoConnect: true,
    });

    setSock(s);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    setConnected(Boolean(s.connected));

    return () => {
      try {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
      } catch {}

      // ✅ tránh dính session cũ khi user đổi/logout
      closeSocket();
      setSock(null);
      setConnected(false);
    };
  }, [user?._id, token]);

  const value = useMemo<SocketCtx>(
    () => ({
      socket: sock ?? getSocket(),
      connected,
    }),
    [sock, connected]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
