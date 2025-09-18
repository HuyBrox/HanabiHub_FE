// Provider quản lý socket connection theo auth state
"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { Socket } from "socket.io-client";
import { RootState } from "@/store";
import {
  createSocketConnection,
  getSocket,
  closeSocket,
} from "@/lib/socketClient";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [connected, setConnected] = React.useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Tạo socket khi user đăng nhập thành công
      try {
        const socket = createSocketConnection({
          userId: user._id,
          autoConnect: true,
        });

        socketRef.current = socket;

        // Cập nhật state khi socket connect/disconnect
        const handleConnect = () => {
          setConnected(true);
        };

        const handleDisconnect = (reason: string) => {
          setConnected(false);
        };

        const handleConnectError = (error: Error) => {
          setConnected(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        // Cleanup listeners khi unmount
        return () => {
          socket.off("connect", handleConnect);
          socket.off("disconnect", handleDisconnect);
          socket.off("connect_error", handleConnectError);
        };
      } catch (error) {
        console.error("Socket initialization error:", error);
        setConnected(false);
      }
    } else {
      // Đóng socket khi user logout
      if (socketRef.current) {
        closeSocket();
        socketRef.current = null;
        setConnected(false);
      }
    }
  }, [isAuthenticated, user?._id]);

  const contextValue: SocketContextType = {
    socket: socketRef.current || getSocket(),
    connected,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
