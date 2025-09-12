export interface AuthFormProps {
  mode: "login" | "register"
  onModeChange: (mode: "login" | "register") => void
  isModal?: boolean
}

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "login" | "register"
}

export interface AuthPageProps {
  defaultMode?: "login" | "register"
}
