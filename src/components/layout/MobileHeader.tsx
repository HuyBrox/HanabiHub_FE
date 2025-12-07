"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  BookOpen,
  Users,
  CreditCard,
  Bot,
  User,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Video,
  Bell,
} from "lucide-react";
import { ModeToggle, LanguageToggle } from "@/components/common";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/useAuth";
import { MobileHeaderProps, NavigationItem, LayoutUser } from "@/types/layout";
import { NotificationPanel } from "@/components/notification/NotificationPanel";
import { useSocketContext } from "@/providers/SocketProvider";
import { buildApiUrl } from "@/utils/api-helper";
import styles from "./MobileHeader.module.css";

const navigation: NavigationItem[] = [
  { name: "Home", href: "/", icon: Home, key: "nav.home" },
  { name: "Courses", href: "/courses", icon: BookOpen, key: "nav.courses" },
  { name: "Community", href: "/community", icon: Users, key: "nav.community" },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageCircle,
    key: "nav.messages",
  },
  {
    name: "Video Call",
    href: "/call/random",
    icon: Video,
    key: "nav.videoCall",
  },
  {
    name: "Flashcards",
    href: "/flashcards",
    icon: CreditCard,
    key: "nav.flashcards",
  },
  {
    name: "AI Practice",
    href: "/ai-practice",
    icon: Bot,
    key: "nav.aiPractice",
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
    key: "nav.notifications",
  },
  { name: "Profile", href: "/profile", icon: User, key: "nav.profile" },
];

export function MobileHeader({}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { socket, connected } = useSocketContext();

  // ✅ Fetch unread count from API
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
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

  // Fetch unread count when authenticated
  useEffect(() => {
    if (isAuthenticated && connected) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, connected]);

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket || !connected || !isAuthenticated) return;

    const handleNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, connected, isAuthenticated]);

  const handleOpenNotificationPanel = () => {
    setIsNotificationPanelOpen(true);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src="/images/logos/logohanabi.png"
              alt="HanabiHub Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-foreground">HanabiHub</span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user?.avatar ? (
            <img
              src={user.avatar || "/images/placeholders/placeholder.svg"}
              alt={user.fullname || user.username || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm font-medium text-foreground truncate max-w-20">
            {isAuthenticated ? (user?.fullname || user?.username || "User") : "Guest"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/logos/logohanabi.png"
                    alt="HanabiHub Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="font-semibold text-foreground">
                  HanabiHub
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const isProfileItem = item.key === "nav.profile";
                const isNotificationItem = item.key === "nav.notifications";

                return (
                  <div key={item.name} className="relative">
                    {isNotificationItem && isAuthenticated ? (
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        onClick={() => {
                          handleOpenNotificationPanel();
                          setIsMenuOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start gap-3 text-foreground hover:bg-accent",
                          isActive &&
                            "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{t(item.key)}</span>
                        {/* Notification badge */}
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 rounded-full flex items-center justify-center px-1">
                            <span className="text-white text-xs font-bold">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 text-foreground hover:bg-accent",
                            isActive &&
                              "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          {isProfileItem && isAuthenticated && user?.avatar ? (
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.fullname || user.username || "User"}
                              className="h-4 w-4 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span>
                            {isProfileItem && isAuthenticated && user?.avatar
                              ? (user.fullname || user.username || "User")
                              : t(item.key)}
                          </span>
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Mobile Menu Footer */}
            <div className="p-4 border-t border-border space-y-2">
              <div className="flex justify-start">
                <LanguageToggle collapsed={false} />
              </div>
              <div className="flex justify-start items-center">
                <ModeToggle />
                <span className="ml-3 text-sm text-foreground">Theme</span>
              </div>
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-foreground hover:bg-accent"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span>{t("nav.logout")}</span>
                </Button>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-foreground hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>{t("nav.login")}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel - Tách riêng component */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
}
