"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, CheckCheck, Search } from "lucide-react";
import { useNotification } from "@/components/notification/NotificationProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildApiUrl } from "@/utils/api-helper";
import LatestNewsPreview from '@/components/news/LatestNewsPreview';
import NewsDetail from '@/components/news/NewsDetail';

interface Notification {
  _id: string;
  type: "system" | "personal";
  title: string;
  content: string;
  isSystem: boolean;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
  sender?: any;
}

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  author: any;
  views: number;
  tags: string[];
  publishedAt: string;
  createdAt: string;
  image?: string;
}

type ContentType = "notifications" | "news";

function NotificationsPageContent() {
  const searchParams = useSearchParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<ContentType>("notifications");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { success, error } = useNotification();

  const limit = 50;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === "unread" ? "true" : "false";
      const response = await fetch(
        buildApiUrl(`/notifications/my?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`),
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      if (data.success && data.data?.items) {
        // Filter out notifications that are about news (they have metadata.newsId)
        const filteredItems = data.data.items.filter(
          (item: any) => !item.metadata?.newsId && !item.newsId
        );
        setNotifications(filteredItems);
        setTotal(data.data.total);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single news item by id (used when a notification relates to a news)
  const fetchNewsById = async (newsId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/news/${newsId}`), {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch news");
      const data = await response.json();
      if (data.success && data.data) return data.data as NewsItem;
    } catch (err) {
      console.error("Error fetching related news:", err);
    }
    return null;
  };

  // Select a news by id and load its full content
  const handleSelectNews = async (newsId: string) => {
    setSelectedNewsId(newsId);
    const fullNews = await fetchNewsById(newsId);
    if (fullNews) {
      setSelectedNews(fullNews);
      setContentType('news');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        queryParams.append("search", searchQuery);
      }

      const response = await fetch(
        buildApiUrl(`/news/public?${queryParams.toString()}`),
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();

      console.log("📰 News API Response:", data);
      console.log("📰 News items:", data.data?.items);

      if (data.success && data.data?.items) {
        setNews(data.data.items);
        setTotal(data.data.total);
        console.log("✅ News loaded:", data.data.items.length);
      } else {
        console.log("❌ No news data in response");
        setNews([]);
      }
    } catch (err) {
      console.error("❌ Error fetching news:", err);
      error("Không thể tải tin tức");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contentType === "notifications") {
      fetchNotifications();
    } else {
      fetchNews();
    }
  }, [page, filter, contentType]);

  // Recent articles state & fetch (show 3-5 latest published articles under a news detail)
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const fetchRecentNews = async () => {
    try {
      setRecentLoading(true);
      const response = await fetch(buildApiUrl(`/news/public?page=1&limit=5&status=published`), { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch recent news");
      const data = await response.json();
      if (data.success && data.data?.items) {
        setRecentNews(data.data.items);
      } else {
        setRecentNews([]);
      }
    } catch (err) {
      console.error("Error fetching recent news:", err);
      setRecentNews([]);
    } finally {
      setRecentLoading(false);
    }
  };

  // Keep the recent list fresh (load when entering the News tab)
  useEffect(() => {
    if (contentType === 'news') {
      fetchRecentNews();
    }
  }, [contentType]);

  // If a query parameter 'openId' is present, open that notification by id
  useEffect(() => {
    const openId = searchParams?.get("openId");
    if (openId) {
      // If we have the notification in state, select it, otherwise fetch notifications then select
      const existing = notifications.find((n) => n._id === openId);
      if (existing) {
        setSelectedNotification(existing);
        setContentType("notifications");
        if (!existing.isRead) markAsRead(existing._id);
      } else {
        // Fetch notifications and then set selected after they load
        (async () => {
          await fetchNotifications();
          const found = notifications.find((n) => n._id === openId);
          if (found) {
            setSelectedNotification(found);
            setContentType("notifications");
            if (!found.isRead) markAsRead(found._id);
          }
        })();
      }
    }
  }, [searchParams]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        buildApiUrl(`/notifications/${notificationId}/read`),
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      success("Đã đánh dấu đã đọc");
    } catch (err) {
      console.error("Error marking as read:", err);
      error("Không thể đánh dấu đã đọc");
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      await Promise.all(
        unreadNotifications.map((n) =>
          fetch(buildApiUrl(`/notifications/${n._id}/read`), {
            method: "PUT",
            credentials: "include",
          })
        )
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      success("Đã đánh dấu tất cả đã đọc");
    } catch (err) {
      console.error("Error marking all as read:", err);
      error("Không thể đánh dấu tất cả");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày`;

    return date.toLocaleDateString("vi-VN");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((notif) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      notif.title.toLowerCase().includes(query) ||
      notif.content.toLowerCase().includes(query)
    );
  });

  const filteredNews = news.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  });

  const currentList = contentType === "notifications" ? filteredNotifications : filteredNews;

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Notifications List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Thông báo
            </h1>
            {contentType === "notifications" && unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-2">
                {unreadCount}
              </Badge>
            )}
          </div>

          {/* Content Type Tabs */}
          <div className="flex gap-2 mb-3">
            <Button
              variant={contentType === "notifications" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setContentType("notifications");
                setSelectedNotification(null);
                setSelectedNews(null);
                setSelectedNewsId(null);
                setSearchQuery(""); // Reset search
                setPage(1);
              }}
              className="flex-1"
            >
              🔔 Thông báo
            </Button>
            <Button
              variant={contentType === "news" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setContentType("news");
                setSelectedNotification(null);
                setSelectedNews(null);
                setSelectedNewsId(null);
                setSearchQuery(""); // Reset search
                setPage(1);
              }}
              className="flex-1"
            >
              📰 Tin tức
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                contentType === "notifications"
                  ? "Tìm kiếm thông báo..."
                  : "Tìm kiếm tin tức..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>

          {/* Filter Tabs - Only for notifications */}
          {contentType === "notifications" && (
            <>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="flex-1"
                >
                  Tất cả
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                  className="flex-1"
                >
                  Chưa đọc
                </Button>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="w-full mt-2 text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </>
          )}
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {currentList.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? `Không tìm thấy ${contentType === "notifications" ? "thông báo" : "tin tức"}`
                    : contentType === "notifications" && filter === "unread"
                    ? "Không có thông báo chưa đọc"
                    : `Chưa có ${contentType === "notifications" ? "thông báo" : "tin tức"} nào`}
                </p>
              </div>
            ) : contentType === "notifications" ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={async () => {
                      // If notification references a news, open that news instead
                      const newsId = (notification as any).metadata?.newsId || (notification as any).newsId;
                      if (newsId) {
                        // Use unified handler so selectedNewsId is set consistently
                        await handleSelectNews(newsId);
                      } else {
                        setSelectedNotification(notification);
                      }
                      if (!notification.isRead) {
                        markAsRead(notification._id);
                      }
                    }}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                    selectedNotification?._id === notification._id
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  } ${!notification.isRead ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === "system"
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-green-100 dark:bg-green-900"
                      }`}
                    >
                      <Bell
                        className={`w-4 h-4 ${
                          notification.type === "system"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.type === "system" && (
                          <Badge variant="secondary" className="h-4 text-xs px-1">
                            Hệ thống
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredNews.map((newsItem) => (
                <div
                  key={newsItem._id}
                  onClick={() => handleSelectNews(newsItem._id)}
                  className={`p-4 mb-3 rounded-xl cursor-pointer transition-all border ${
                    selectedNews?._id === newsItem._id
                      ? "bg-accent border-primary shadow-md"
                      : "bg-card border-border hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* News Thumbnail - Larger and better styled */}
                    {newsItem.image ? (
                      <div className="flex-shrink-0">
                        <img
                          src={newsItem.image}
                          alt={newsItem.title}
                          className="w-16 h-16 rounded-lg object-cover border border-border shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 flex items-center justify-center border border-orange-200 dark:border-orange-700">
                        <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-foreground">
                        {newsItem.title}
                      </h3>
                      {/* Better excerpt with HTML stripping */}
                      <div
                        className="text-xs text-muted-foreground line-clamp-2 mb-2 prose prose-xs max-w-none
                          prose-p:text-muted-foreground prose-p:mb-1
                          prose-headings:hidden
                          prose-img:hidden
                          prose-a:text-primary prose-a:no-underline"
                        dangerouslySetInnerHTML={{
                          __html: newsItem.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                        }}
                      />
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-medium">
                          {formatTime(newsItem.publishedAt || newsItem.createdAt)}
                        </span>
                        <Badge variant="secondary" className="h-5 text-xs px-2 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                          📰 Tin tức
                        </Badge>
                        {newsItem.views > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            👁️ {newsItem.views}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Load More */}
        {!loading && total > limit && (
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                /* TODO: Load more */
              }}
            >
              Xem thêm ({total - limit} thông báo)
            </Button>
          </div>
        )}
      </div>

      {/* Right Side - Content Detail */}
      <div className="flex-1 flex flex-col bg-background">
        {contentType === 'news' ? (
          selectedNews ? (
            <NewsDetail news={selectedNews} />
          ) : (
            <LatestNewsPreview recentNews={recentNews} loading={recentLoading} onSelect={handleSelectNews} maxItems={5} />
          )
        ) : selectedNotification ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedNotification.type === "system"
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-green-100 dark:bg-green-900"
                    }`}
                  >
                    <Bell
                      className={`w-6 h-6 ${
                        selectedNotification.type === "system"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">
                      {selectedNotification.title}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatTime(selectedNotification.createdAt)}</span>
                      {selectedNotification.type === "system" ? (
                        <Badge variant="secondary">Thông báo hệ thống</Badge>
                      ) : (
                        <Badge variant="secondary">Thông báo cá nhân</Badge>
                      )}
                      {selectedNotification.isRead && (
                        <Badge variant="outline" className="text-xs">
                          Đã đọc
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {selectedNotification.content}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-muted flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Bell className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {contentType === "notifications" ? "Thông báo của bạn" : "Tin tức"}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-sm">
                {contentType === "notifications"
                  ? "Chọn một thông báo từ danh sách để xem chi tiết"
                  : "Chọn một tin tức từ danh sách để xem chi tiết"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <NotificationsPageContent />
    </Suspense>
  );
}

