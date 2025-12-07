"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Heart, MessageCircle, UserPlus, BookOpen, Bell } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSocketContext } from "@/providers/SocketProvider";
import styles from "./notification.module.css";
import { buildApiUrl } from "@/utils/api-helper";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  _id: string;
  type: "system" | "personal" | "like" | "follow" | "message" | "course";
  title: string;
  content: string;
  sender?: {
    _id: string;
    username: string;
    fullname: string;
    avatar?: string;
  };
  isRead: boolean;
  createdAt: string;
  image?: string; // Optional image for news notifications
  newsId?: string; // Optional news ID for deep linking
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case "message":
      return <MessageCircle className="h-4 w-4 text-green-500" />;
    case "course":
      return <BookOpen className="h-4 w-4 text-orange-500" />;
    case "system":
      return <Bell className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  
  // Format as "Sep 01" for older dates
  return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { t } = useLanguage();
  const { socket, connected } = useSocketContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"thisMonth" | "previous">("thisMonth");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch notifications từ API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        buildApiUrl("/notifications/my?limit=50"),
        { credentials: "include" }
      );

      if (!response.ok) {
        console.error("Failed to fetch notifications");
        return;
      }

      const data = await response.json();
      if (data.success && data.data?.items) {
        setNotifications(data.data.items);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNotification = (data: any) => {
      console.log("🔔 Received notification:", data);
      console.log(`   Type: ${data.type}`);
      console.log(`   Title: ${data.title}`);
      console.log(`   Has Image: ${!!data.image}`);
      if (data.image) {
        console.log(`   Image size: ${(data.image.length / 1024).toFixed(2)}KB`);
        console.log(`   Image type: ${typeof data.image}`);
        console.log(`   Image preview (first 50 chars): ${data.image.substring(0, 50)}...`);
      }
      
      const newNotification: Notification = {
        _id: data.notificationId || Date.now().toString(),
        type: data.type || "system",
        title: data.title || "Thông báo mới",
        content: data.message || data.content || "",
        sender: data.sender,
        isRead: false,
        createdAt: new Date().toISOString(),
        image: data.image, // Image is already in socket event from backend
        newsId: data.newsId,
      };

      console.log(`📸 Notification image in state: ${newNotification.image ? "YES ✅" : "NO ❌"}`);

      // If no image in socket but has newsId, fetch from API
      if (!data.image && data.newsId) {
        console.log(`📰 No image in socket, fetching news ${data.newsId}...`);
        fetch(buildApiUrl(`/news/${data.newsId}`), { credentials: "include" })
          .then((res) => res.json())
          .then((json) => {
            console.log(`📸 News fetch response:`, json);
            if (json.success && json.data?.image) {
              console.log(`✅ Got image for notification, updating state...`);
              setNotifications((prev) =>
                prev.map((n) => {
                  if (n._id === newNotification._id) {
                    console.log(`✅ Setting image for notification ${n._id}`);
                    return { ...n, image: json.data.image };
                  }
                  return n;
                })
              );
            } else {
              console.warn(`❌ No image in news data for ${data.newsId}`);
            }
          })
          .catch((err) => console.error("❌ Failed to fetch news for notification image:", err));
      }

      setNotifications((prev) => [newNotification, ...prev]);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, connected]);

  // Mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(buildApiUrl(`/notifications/${notificationId}/read`), {
        method: "PUT",
        credentials: "include",
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Filter notifications: This month vs Previous
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const thisMonthNotifications = notifications.filter(
    (n) => new Date(n.createdAt) >= currentMonthStart
  );
  const previousNotifications = notifications.filter(
    (n) => new Date(n.createdAt) < currentMonthStart
  );

  const currentNotifications = activeTab === "thisMonth" ? thisMonthNotifications : previousNotifications;

  return (
    <div className={cn(styles.notificationPanel, !isOpen && styles.closed)}>
      <div className={styles.notificationPanelContent}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Thông báo</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("thisMonth")}
            className={cn(styles.tab, activeTab === "thisMonth" && styles.active)}
          >
            Tháng này
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("previous")}
            className={cn(styles.tab, activeTab === "previous" && styles.active)}
          >
            Trước đó
          </Button>
        </div>

        {/* Notifications List */}
        <div className={styles.notificationsList}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
            </div>
          ) : currentNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <Bell className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>Không có thông báo nào</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {currentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => {
                    // mark as read
                    if (!notification.isRead) handleMarkAsRead(notification._id);
                    // If this notification links to a news, navigate to the news detail page
                    if (notification.newsId) {
                      router.push(`/news/${notification.newsId}`);
                      // Close panel
                      onClose();
                      return;
                    }

                    // For non-news notifications, open the notifications page and highlight the notification
                    router.push(`/notifications?openId=${notification._id}`);
                    onClose();
                  }}
                >
                  <div className="relative">
                    {notification.image ? (
                      // Show image thumbnail for news notifications
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-gray-300">
                        <img
                          src={notification.image}
                          alt={notification.title}
                          className="h-full w-full object-cover"
                          style={{ width: "40px", height: "40px", display: "block" }}
                          onError={(e) => {
                            console.warn(`❌ Image failed to load for notification ${notification._id}`);
                            console.warn(`   Image URL (first 100 chars): ${String(notification.image).substring(0, 100)}`);
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                          onLoad={() => {
                            console.log(`✅ Image loaded successfully for notification ${notification._id}`);
                            console.log(`   Image size: ${(notification.image?.length || 0) / 1024}KB`);
                          }}
                        />
                      </div>
                    ) : (
                      // Fallback to avatar
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={notification.sender?.avatar || "/placeholder.svg"}
                          alt={notification.sender?.fullname || notification.title || "System"}
                        />
                        <AvatarFallback>
                          {notification.sender?.fullname?.slice(0, 2).toUpperCase() || "SY"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{notification.sender?.fullname || notification.title}</span>{" "}
                      <span className="text-muted-foreground">{notification.content}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.createdAt)}</p>
                  </div>
                  {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

