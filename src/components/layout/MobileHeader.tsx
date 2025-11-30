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
} from "lucide-react";
import { ModeToggle, LanguageToggle, JapaneseInputModeToggle } from "@/components/common";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/useAuth";
import { MobileHeaderProps, NavigationItem, LayoutUser } from "@/types/layout";
import { useSearch } from "@/contexts/SearchContext";
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
];

export function MobileHeader({}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { openSearch } = useSearch();

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
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 text-foreground hover:bg-accent px-3 py-2",
                        isActive &&
                          "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{t(item.key)}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Search Button */}
              <Button
                variant="ghost"
                onClick={() => {
                  openSearch();
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start gap-3 text-foreground hover:bg-accent px-3 py-2"
              >
                <Search className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{t("nav.search") || "Tìm kiếm"}</span>
              </Button>

              {/* Profile/User Section */}
              {isAuthenticated ? (
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={pathname === "/profile" ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-foreground hover:bg-accent px-3 py-2",
                      pathname === "/profile" &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
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
                    <span className="font-medium truncate">
                      {user?.fullname || user?.username || "User"}
                    </span>
                  </Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-foreground hover:bg-accent px-3 py-2"
                  >
                    <User className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{t("nav.login")}</span>
                  </Button>
                </Link>
              )}
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
              <JapaneseInputModeToggle collapsed={false} />
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-foreground hover:bg-accent px-3 py-2"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{t("nav.logout")}</span>
                </Button>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-foreground hover:bg-accent px-3 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{t("nav.login")}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
