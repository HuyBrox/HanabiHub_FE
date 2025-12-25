"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSocketContext } from "@/providers/SocketProvider";
import styles from "./notification.module.css";

import { buildApiUrl } from "@/utils/api-helper";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { socket, connected } = useSocketContext();

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        buildApiUrl("/notifications/my?unreadOnly=true&limit=1"),
        { credentials: "include" }
      );

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.data) {
        setUnreadCount(data.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchUnreadCount();
    }
  }, [connected]);

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNotification = () => {
      // Increase count when new notification arrives
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, connected]);

  const handleClick = () => {
    router.push("/notifications");
  };

  return (
    <button
      onClick={handleClick}
      className={styles.bellButton}
      title="Thông báo"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className={`${styles.badge} ${styles.hasNotifications}`}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

