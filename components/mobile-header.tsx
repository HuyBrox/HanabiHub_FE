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

const mockUser = {
  name: "Nguyễn Văn A",
  avatar: "/anime-style-avatar-user.png", // Set to null to test default icon
}

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">日</span>
          </div>
          <span className="font-semibold text-foreground">JapanLearn</span>
        </div>

        <div className="flex items-center gap-3">
          {mockUser.avatar ? (
            <img
              src={mockUser.avatar || "/placeholder.svg"}
              alt={mockUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm font-medium text-foreground truncate max-w-20">{mockUser.name}</span>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div
            className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">日</span>
                </div>
                <span className="font-semibold text-foreground">JapanLearn</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="text-foreground">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const isProfileItem = item.key === "nav.profile"

                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 text-foreground hover:bg-accent",
                        isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {isProfileItem && mockUser.avatar ? (
                        <img
                          src={mockUser.avatar || "/placeholder.svg"}
                          alt={mockUser.name}
                          className="h-4 w-4 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span>{isProfileItem && mockUser.avatar ? mockUser.name : t(item.key)}</span>
                    </Button>
                  </Link>
                )
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
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-foreground hover:bg-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>{t("nav.logout")}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
