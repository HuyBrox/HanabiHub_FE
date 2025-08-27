"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, BookOpen, Users, CreditCard, Bot, User, LogOut, Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/language-context"

const navigation = [
  { name: "Home", href: "/", icon: Home, key: "nav.home" },
  { name: "Courses", href: "/courses", icon: BookOpen, key: "nav.courses" },
  { name: "Community", href: "/community", icon: Users, key: "nav.community" },
  { name: "Flashcards", href: "/flashcards", icon: CreditCard, key: "nav.flashcards" },
  { name: "AI Practice", href: "/ai-practice", icon: Bot, key: "nav.aiPractice" },
  { name: "Profile", href: "/profile", icon: User, key: "nav.profile" },
]

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <div
      className={cn(
        "hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header with Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">日</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">JapanLearn</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                  isCollapsed && "px-2",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{t(item.key)}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Language Toggle, Theme Toggle and Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className={cn("flex", isCollapsed ? "justify-center" : "justify-start")}>
          <LanguageToggle collapsed={isCollapsed} />
        </div>
        <div className={cn("flex", isCollapsed ? "justify-center" : "justify-start")}>
          <ModeToggle />
          {!isCollapsed && <span className="ml-3 text-sm text-sidebar-foreground self-center">Theme</span>}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed && "px-2",
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>{t("nav.logout")}</span>}
        </Button>
      </div>
    </div>
  )
}
