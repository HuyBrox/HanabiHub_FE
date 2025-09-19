// Quản lý kết nối Socket.IO client duy nhất cho toàn app
import { io as clientIo, Socket } from "socket.io-client";

let socket: Socket | null = null;

type ConnectOptions = {
  userId?: string;
  token?: string;
  path?: string;
  autoConnect?: boolean;
};

// Lấy socket instance hiện tại
export function getSocket(): Socket | null {
  return socket;
}

// Tạo kết nối socket mới với server
export function createSocketConnection(opts: ConnectOptions = {}): Socket {
  // Nếu đã có socket kết nối, dùng lại
  if (socket && socket.connected) {
    return socket;
  }

  // Cleanup socket cũ trước khi tạo mới
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

  // Tạo socket connection với config tối ưu
  socket = clientIo(SERVER_URL, {
    path: opts.path || "/socket.io",
    autoConnect: opts.autoConnect ?? true,
    transports: ["polling", "websocket"], // Polling trước để tránh WebSocket frame error
    upgrade: true, // Cho phép upgrade sau khi kết nối ổn định
    withCredentials: true,
    query,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true,
  });

  // Lắng nghe các sự kiện kết nối
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
    try {
      console.log(
        "🚀 Transport:",
        (socket as any).conn?.transport?.name || "unknown"
      );
    } catch (e) {
      // Ignore transport logging error
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err: any) => {
    // WebSocket error là bình thường, chỉ warning
    if (err.message === "websocket error") {
      console.warn("⚠️ WebSocket không khả dụng, fallback về polling");
      return; // Không log error cho trường hợp này
    }

    // Chỉ log error cho các lỗi thực sự
    console.error("🔴 Socket connection error:", err.message || err);
    console.error("🔍 Error details:", {
      type: err.type || "unknown",
      description: err.description || "no description",
      message: err.message || "no message",
    });
  });

  // Listen cho transport events nếu có thể
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
  } catch (e) {
    // Ignore if conn events not available
  }

  return socket;
}

// Đóng socket connection và cleanup
export function closeSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
