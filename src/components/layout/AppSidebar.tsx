"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Search,
  Settings,
} from "lucide-react";
import { ModeToggle, LanguageToggle, JapaneseInputModeToggle } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/language-context";
import { AppSidebarProps, NavigationItem } from "@/types/layout";
import { useSearch } from "@/contexts/SearchContext";
import { SearchComponent } from "@/components/search/SearchComponent";
import styles from "./AppSidebar.module.css";

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
];

export function AppSidebar({}: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { openSearch, closeSearch, isSearchOpen } = useSearch();

  return (
    <div
      className={cn(
        "hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isSearchOpen ? "w-16" : isCollapsed ? "w-16" : "w-64"
      )}
      style={{
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Header with Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && !isSearchOpen && (
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
            <span className="font-semibold text-sidebar-foreground">
              HanabiHub
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isSearchOpen) {
              closeSearch();
            }
            setIsCollapsed(!isCollapsed);
          }}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed || isSearchOpen ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (isSearchOpen) {
                  closeSearch();
                }
              }}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2",
                  isActive &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  (isCollapsed || isSearchOpen) && "px-2 justify-center"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && !isSearchOpen && <span className="font-medium">{t(item.key)}</span>}
              </Button>
            </Link>
          );
        })}

        {/* Admin Management Button - Only show for admin users */}
        {isAuthenticated && user?.isAdmin && (
          <Link href="/admin/dashboard">
            <Button
              variant={pathname?.startsWith("/admin") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2",
                pathname?.startsWith("/admin") &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                (isCollapsed || isSearchOpen) && "px-2 justify-center"
              )}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && !isSearchOpen && (
                <span className="font-medium">{t("nav.admin") || "Quản lý"}</span>
              )}
            </Button>
          </Link>
        )}

        {/* Search Button */}
        <Button
          variant={isSearchOpen ? "default" : "ghost"}
          onClick={() => {
            if (isSearchOpen) {
              closeSearch();
            } else {
              openSearch();
            }
          }}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2",
            isSearchOpen &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
            (isCollapsed || isSearchOpen) && "px-2 justify-center"
          )}
        >
          <Search className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && !isSearchOpen && (
            <span className="font-medium">{t("nav.search") || "Tìm kiếm"}</span>
          )}
        </Button>

        {/* Profile/Login section */}
        {isAuthenticated ? (
          <Link href="/profile">
            <Button
              variant={pathname === "/profile" ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2",
                pathname === "/profile" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                (isCollapsed || isSearchOpen) && "px-2 justify-center"
              )}
            >
              {(isCollapsed || isSearchOpen) ? (
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user?.avatar || "/placeholder.svg"}
                    alt={user?.fullname || user?.username || "User"}
                  />
                  <AvatarFallback className="text-xs">
                    {user?.fullname?.charAt(0)?.toUpperCase() ||
                      user?.username?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.fullname || user?.username || "User"}
                    />
                    <AvatarFallback className="text-xs">
                      {user?.fullname?.charAt(0)?.toUpperCase() ||
                        user?.username?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">
                    {user?.fullname || user?.username || "User"}
                  </span>
                </>
              )}
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2",
                (isCollapsed || isSearchOpen) && "px-2 justify-center"
              )}
            >
              <User className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && !isSearchOpen && (
                <span className="font-medium">{t("nav.login")}</span>
              )}
            </Button>
          </Link>
        )}
      </nav>

      {/* Language Toggle, Theme Toggle, Japanese Input Mode Toggle and Auth Button */}
      {!isSearchOpen && (
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div
            className={cn(
              "flex",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <LanguageToggle collapsed={isCollapsed} />
          </div>
          <div
            className={cn(
              "flex",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <ModeToggle />
            {!isCollapsed && (
              <span className="ml-3 text-sm text-sidebar-foreground self-center font-medium">
                {t("nav.theme")}
              </span>
            )}
          </div>

          {/* Japanese Input Mode Toggle */}
          <JapaneseInputModeToggle collapsed={isCollapsed} />

          {/* Auth Button - Login/Logout */}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              onClick={logout}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2",
                isCollapsed && "px-2 justify-center"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{t("nav.logout")}</span>}
            </Button>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2",
                  isCollapsed && "px-2 justify-center"
                )}
              >
                <User className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{t("nav.login")}</span>}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
