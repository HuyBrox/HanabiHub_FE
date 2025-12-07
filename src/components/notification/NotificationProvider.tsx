"use client";

import { createContext, useContext, useState, useEffect } from "react";
import NotificationContainer from "./NotificationContainer";
import { useSocketContext } from "@/providers/SocketProvider";
import { buildApiUrl } from "@/utils/api-helper";

const NotificationContext = createContext<any>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { socket, connected } = useSocketContext();
  const [hasLoadedNotifications, setHasLoadedNotifications] = useState(false);

  const removeNotification = async (id: number, notificationId?: string) => {
    // Mark as read in backend if notificationId provided
    if (notificationId) {
      try {
        await fetch(buildApiUrl(`/notifications/${notificationId}/read`), {
          method: 'PUT',
          credentials: 'include',
        });
        console.log(`✅ Marked notification ${notificationId} as read`);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (notification: any) => {
    const id = Date.now() + Math.random();
    const newNotif = { id, ...notification, timestamp: Date.now() };
    setNotifications((prev) => [newNotif, ...prev]);

    if (notification.duration !== 0) {
      setTimeout(() => removeNotification(id, notification.notificationId), notification.duration || 5000);
    }

    return id;
  };

  const removeAll = () => setNotifications([]);

  // Fetch unread notifications when user connects
  useEffect(() => {
    if (!connected || hasLoadedNotifications) return;

    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch(buildApiUrl("/notifications/my?unreadOnly=true&limit=5"), {
          credentials: "include", // Send cookies
        });

        if (!response.ok) {
          console.log("Failed to fetch notifications:", response.status);
          return;
        }

        const data = await response.json();
        
        if (data.success && data.data?.items) {
          const unreadNotifications = data.data.items;
          console.log(`📬 Loaded ${unreadNotifications.length} unread notifications`);

          // Display each unread notification
          unreadNotifications.forEach((notif: any) => {
            addNotification({
              type: notif.type === "system" ? "info" : "success",
              message: notif.content,
              title: notif.title,
              duration: 0, // Persistent until user closes
              notificationId: notif._id, // Pass backend notification ID for mark as read
              metadata: notif.metadata || undefined,
            });
          });
        }

        setHasLoadedNotifications(true);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Delay slightly to ensure auth is ready
    const timer = setTimeout(fetchUnreadNotifications, 1000);
    return () => clearTimeout(timer);
  }, [connected, hasLoadedNotifications]);

  // Listen for real-time notifications from socket
  useEffect(() => {
    if (!socket || !connected) return;

    // Track processed notification IDs to prevent duplicates
    const processedIds = new Set<string>();

    const handleNotification = (payload: any) => {
      // Prevent duplicate notifications
      const notificationId = payload.notificationId || payload._id || `${payload.title}-${payload.message}`;
      if (processedIds.has(notificationId)) {
        console.log("⚠️ Duplicate notification ignored:", notificationId);
        return;
      }
      processedIds.add(notificationId);

      // Clean up old IDs after 1 minute to prevent memory leak
      setTimeout(() => processedIds.delete(notificationId), 60000);

      console.log("📢 Received notification from socket:", payload);
      
      // Display notification toast
      addNotification({
        type: payload.type === "system" ? "info" : "success",
        message: payload.message || payload.content,
        title: payload.title,
        duration: 8000, // Show for 8 seconds
        notificationId: payload.notificationId || payload._id, // Pass backend notification ID for mark as read
        metadata: payload.metadata || (payload.newsId ? { newsId: payload.newsId } : undefined),
        newsId: payload.newsId,
        image: payload.image,
      });

      // Play notification sound (optional)
      try {
        const audio = new Audio("/assets/audio/thong_bao_mess.mp3");
        audio.volume = 0.3;
        audio.play().catch((e) => console.log("Audio play failed:", e));
      } catch (e) {
        console.log("Audio error:", e);
      }
    };

    // Listen for notification event
    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      processedIds.clear();
    };
  }, [socket, connected]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        removeAll,
        success: (msg: string, opts = {}) =>
          addNotification({ ...opts, type: "success", message: msg }),
        error: (msg: string, opts = {}) =>
          addNotification({ ...opts, type: "error", message: msg }),
        warning: (msg: string, opts = {}) =>
          addNotification({ ...opts, type: "warning", message: msg }),
        info: (msg: string, opts = {}) =>
          addNotification({ ...opts, type: "info", message: msg }),
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};
