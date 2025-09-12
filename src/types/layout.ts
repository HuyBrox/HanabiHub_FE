export interface AppSidebarProps {
  // Add props if needed
}

export interface MobileHeaderProps {
  // Add props if needed
}

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  key: string
}

export interface User {
  isLoggedIn: boolean
  name: string
  avatar: string
}
