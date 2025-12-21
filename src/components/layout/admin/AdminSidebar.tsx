<<<<<<< HEAD
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
  User,
} from "lucide-react";
import { NotificationPanel } from "@/components/notification/NotificationPanel";
import { useAuth } from "@/hooks/useAuth";
import { useSocketContext } from "@/providers/SocketProvider";
import { buildApiUrl } from "@/utils/api-helper";

interface AdminSidebarProps {
  className?: string;
}

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Course Management",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Content & Notifications",
    href: "/admin/content",
    icon: Bell,
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { socket, connected } = useSocketContext();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const handleOpenPanel = () => {
    setIsNotificationPanelOpen(true);
  };

  return (
    <>
      <div className={cn("flex h-full w-64 flex-col bg-slate-900 text-white", className)}>
        {/* Header */}
        <div className="flex h-16 items-center justify-center border-b border-slate-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}

          {/* Notification Bell - Opens Panel */}
          {isAuthenticated && (
            <div className="relative mt-2">
              <Button
                variant="ghost"
                onClick={handleOpenPanel}
                className={cn(
                  "w-full justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-white",
                  isNotificationPanelOpen && "bg-slate-800 text-white"
                )}
              >
                <Bell className="h-5 w-5 flex-shrink-0" />
                <span>Thông báo</span>
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* User Profile Section - Chỉ hiển thị khi đã đăng nhập */}
          {isAuthenticated && user && (
            <Link href="/profile">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-white mt-2",
                  pathname === "/profile" && "bg-slate-800 text-white"
                )}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.fullname || user.username || "User"} />
                  <AvatarFallback className="text-xs">
                    {(user.fullname || user.username || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user.fullname || user.username || "User"}</span>
              </Button>
            </Link>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-slate-400">admin@japanlearn.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel - Tách riêng component */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
}
=======
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Course Management",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Content & Notifications",
    href: "/admin/content",
    icon: Bell,
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full w-64 flex-col bg-slate-900 text-white", className)}>
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {adminMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-slate-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@japanlearn.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> origin/main
