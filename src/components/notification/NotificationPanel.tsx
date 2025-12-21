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
  sidebarCollapsed?: boolean;
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

export function NotificationPanel({ isOpen, onClose, sidebarCollapsed = true }: NotificationPanelProps) {
  const { t } = useLanguage();
  const { socket, connected } = useSocketContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"thisMonth" | "previous">("thisMonth");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Adjust left position to match sidebar width (collapsed: 4rem, expanded: 16rem)
  const leftValue = sidebarCollapsed ? "4rem" : "16rem";

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
        const items = data.data.items;
        setNotifications(items);

        // Auto-expand "news test 2" for demo: fetch its news data if available
        try {
          const demoNotif = items.find((n: any) => String(n.title || '').toLowerCase().includes('news test 2'));
          if (demoNotif && demoNotif.newsId) {
            (async () => {
              try {
                const res = await fetch(buildApiUrl(`/news/${demoNotif.newsId}`), { credentials: 'include' });
                const json = await res.json();
                if (json.success && json.data) {
                  setNotifications((prev) => prev.map((n) => n._id === demoNotif._id ? { ...n, _expanded: true, newsData: json.data } : n));
                } else {
                  setNotifications((prev) => prev.map((n) => n._id === demoNotif._id ? { ...n, _expanded: true } : n));
                }
              } catch (err) {
                console.error('Failed to fetch news for demo inline preview', err);
                setNotifications((prev) => prev.map((n) => n._id === demoNotif._id ? { ...n, _expanded: true } : n));
              }
            })();
          }
        } catch (err) {
          console.error('Demo auto-expand error', err);
        }
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
    <div
      className={cn(styles.notificationPanel, !isOpen && styles.closed)}
      style={{ left: leftValue }}
    >
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
                <div key={notification._id} className="space-y-2">
                  <div
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={async () => {
                      // mark as read
                      if (!notification.isRead) handleMarkAsRead(notification._id);

                      // If this notification links to a news, toggle inline preview instead of navigating
                      if (notification.newsId) {
                        const isExpanded = !!(notification as any)._expanded;
                        // Toggle expansion flag on the notification in state
                        setNotifications((prev) => prev.map((n) => n._id === notification._id ? { ...n, _expanded: !isExpanded } : n));

                        // If expanding and we don't have news data yet, fetch it
                        if (!isExpanded && !(notification as any).newsData) {
                          try {
                            const res = await fetch(buildApiUrl(`/news/${notification.newsId}`), { credentials: 'include' });
                            const json = await res.json();
                            if (json.success && json.data) {
                              setNotifications((prev) => prev.map((n) => n._id === notification._id ? { ...n, newsData: json.data } : n));
                            }
                          } catch (err) {
                            console.error('Failed to fetch news for inline preview', err);
                          }
                        }

                        // Do not navigate away or close panel
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
                          />
                        </div>
                      ) : (
                        // Fallback to avatar (use notification title for alt/fallback initials, do NOT show sender name)
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={notification.sender?.avatar || "/placeholder.svg"}
                            alt={notification.title || "System"}
                          />
                          <AvatarFallback>
                            {(notification.title ? notification.title.slice(0, 2).toUpperCase() : "NT")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{notification.title || 'Thông báo'}</span>
                      </p>
                      {notification.content && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.content}</div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.createdAt)}</p>
                    </div>
                    {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                  </div>

                  {/* Inline preview for news notifications */}
                  {(notification as any)._expanded && (
                    <div className="mx-3 p-4 rounded-md bg-card border border-border shadow-sm">
                      <div className="flex items-start gap-4">
                        {((notification as any).newsData?.image || notification.image) && (
                          <div className="w-40 overflow-hidden rounded-md flex-shrink-0 bg-muted">
                            <img
                              src={(notification as any).newsData?.image || notification.image}
                              alt={notification.title}
                              className="w-full h-24 object-cover aspect-[16/9]"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-sm md:text-base mb-1">{(notification as any).newsData?.title || notification.title}</h4>
                          <div className="text-sm text-muted-foreground mb-2 line-clamp-4">
                            {((notification as any).newsData?.content && ((notification as any).newsData?.content.length > 200))
                              ? ((notification as any).newsData?.content.slice(0, 200) + '...')
                              : ((notification as any).newsData?.content || notification.content)}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {((notification as any).newsData?.author && ((notification as any).newsData.author.fullname || notification.newsData.author.username)) ?
                              `${(notification as any).newsData.author.fullname || (notification as any).newsData.author.username} • ` : ''}
                            {(notification as any).newsData?.publishedAt ? new Date((notification as any).newsData?.publishedAt).toLocaleDateString('vi-VN') : ''}
                          </div>
                          <div>
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/news/${notification.newsId}`); onClose(); }}
                              className="text-sm text-primary font-medium hover:underline"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

