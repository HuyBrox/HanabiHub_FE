export interface LanguageToggleProps {
  collapsed?: boolean
}

export interface ModeToggleProps {
  // Add props if needed
}

export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: "dark" | "light" | "system"
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export interface ThemeProviderState {
  theme: "dark" | "light" | "system"
  setTheme: (theme: "dark" | "light" | "system") => void
}

export interface TestComponentProps {
  // Add props if needed
}
