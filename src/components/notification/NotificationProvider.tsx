"use client";

import { createContext, useContext, useState } from "react";
import NotificationContainer from "./NotificationContainer";

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

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (notification: any) => {
    const id = Date.now() + Math.random();
    const newNotif = { id, ...notification, timestamp: Date.now() };
    setNotifications((prev) => [newNotif, ...prev]);

    if (notification.duration !== 0) {
      setTimeout(() => removeNotification(id), notification.duration || 5000);
    }

    return id;
  };

  const removeAll = () => setNotifications([]);

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
