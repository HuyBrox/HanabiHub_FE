"use client";

import { useNotification } from "./NotificationProvider";
import NotificationItem from "./NotificationItem";

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((n: any, i: number) => (
        <NotificationItem
          key={n.id}
          notification={n}
          index={i}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}
