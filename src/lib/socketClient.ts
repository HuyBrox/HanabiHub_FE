// Quản lý kết nối Socket.IO cho toàn ứng dụng
import { io as clientIo, Socket } from "socket.io-client";

let socket: Socket | null = null;

type ConnectOptions = {
  userId?: string;
  token?: string;
  path?: string;
  autoConnect?: boolean;
};

// Lấy socket instance hiện tại
// Trả về socket đã kết nối hoặc null nếu chưa có
export function getSocket(): Socket | null {
  return socket;
}

// Tạo kết nối socket mới với server
// Tự động tái sử dụng kết nối cũ nếu còn hoạt động
export function createSocketConnection(opts: ConnectOptions = {}): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

  const query: Record<string, string> = {};
  if (opts.userId) {
    query.userId = opts.userId;
  }
  if (opts.token) query.token = opts.token;

  socket = clientIo(SERVER_URL, {
    path: opts.path || "/socket.io",
    autoConnect: opts.autoConnect ?? true,
    transports: ["polling", "websocket"],
    upgrade: true,
    withCredentials: true,
    query,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
    try {
      console.log(
        "🚀 Transport:",
        (socket as any).conn?.transport?.name || "unknown"
      );
    } catch (e) {}
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err: any) => {
    if (err.message === "websocket error") {
      console.warn("⚠️ WebSocket không khả dụng, fallback về polling");
      return;
    }
    console.error("🔴 Socket connection error:", err.message || err);
    console.error("🔍 Error details:", {
      type: err.type || "unknown",
      description: err.description || "no description",
      message: err.message || "no message",
    });
  });

  try {
    (socket as any).conn?.on("upgrade", () => {
      console.log(
        "⬆️ Transport upgraded to:",
        (socket as any).conn?.transport?.name
      );
    });

    (socket as any).conn?.on("upgradeError", (err: any) => {
      console.warn("⚠️ Transport upgrade failed:", err.message);
    });
  } catch (e) {}

  return socket;
}

// Đóng socket connection và cleanup hoàn toàn
// Xóa tất cả listeners và ngắt kết nối
export function closeSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
