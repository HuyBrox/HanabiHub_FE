"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export default function NotificationItem({
  notification,
  index,
  onRemove,
}: any) {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id, notification.notificationId), 300);
  };

  const icons: any = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const styles: any = {
    success: "border-green-500",
    error: "border-red-500",
    warning: "border-yellow-500",
    info: "border-blue-500",
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg p-4 mb-3 min-w-80 max-w-md
        transform transition-all duration-300 ease-out
        border-l-4 bg-white shadow-lg
        ${styles[notification.type] || "border-gray-500"}
        ${
          isExiting
            ? "translate-x-full opacity-0 scale-95"
            : "translate-x-0 opacity-100 scale-100"
        }
        ${index > 0 ? "opacity-90 scale-95" : "opacity-100"}
        hover:scale-105 hover:shadow-xl animate-slideIn
      `}
      style={{ zIndex: 1000 - index, animationDelay: `${index * 100}ms` }}
    >
      {notification.duration > 0 && (
        <div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-shrink"
          style={{ animationDuration: `${notification.duration}ms` }}
        />
      )}

      <div className="flex items-start space-x-3">
        <div>{icons[notification.type] || icons.info}</div>

        <div className="flex-1">
          {notification.title && (
            <div className="font-semibold text-gray-900">
              {notification.title}
            </div>
          )}
          <div className="text-sm text-gray-700">{notification.message}</div>
        </div>

        <button
          onClick={handleRemove}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    </div>
  );
}
