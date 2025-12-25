// src/lib/socketClient.ts
import { io as clientIo, Socket } from "socket.io-client";

let socket: Socket | null = null;

type ConnectOptions = {
  userId?: string;
  token?: string;
  path?: string;
  autoConnect?: boolean;
};

export function getSocket(): Socket | null {
  return socket;
}

export function createSocketConnection(opts: ConnectOptions = {}): Socket {
  if (socket && (socket.connected || socket.active)) return socket;

  // cleanup old socket
  if (socket) {
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch {}
    socket = null;
  }

  const SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

  const PATH = opts.path || process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

  const FORCE_POLLING =
    (process.env.NEXT_PUBLIC_SOCKET_FORCE_POLLING || "").toLowerCase() ===
      "1" ||
    (process.env.NEXT_PUBLIC_SOCKET_FORCE_POLLING || "").toLowerCase() ===
      "true";

  // ✅ Cách A: nếu FORCE_POLLING=true thì chỉ dùng polling và không upgrade
  const transports = FORCE_POLLING
    ? (["polling"] as const)
    : (["polling", "websocket"] as const);

  socket = clientIo(SERVER_URL, {
    path: PATH,
    autoConnect: opts.autoConnect ?? true,
    withCredentials: true,

    transports: transports as any,
    upgrade: !FORCE_POLLING, // ✅ polling-only => false
    rememberUpgrade: false, // ✅ tránh client nhớ websocket lần trước

    // ✅ tránh nhét token vào query url (đỡ dính handshake)
    auth: {
      userId: opts.userId,
      token: opts.token,
    },

    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
    try {
      const engine = (socket as any).io?.engine;
      console.log("🚀 Transport:", engine?.transport?.name || "unknown");
    } catch {}
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err: any) => {
    console.error("🔴 Socket connect_error:", err?.message || err);
  });

  console.log("📡 Socket initialized:", { SERVER_URL, PATH, FORCE_POLLING });
  return socket;
}

export function closeSocket() {
  if (!socket) return;
  try {
    socket.removeAllListeners();
    socket.disconnect();
  } catch {}
  socket = null;
}
