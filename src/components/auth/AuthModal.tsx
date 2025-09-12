"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AuthForm } from "./AuthForm"
import { AuthModalProps } from "@/types/auth"
import styles from "./AuthModal.module.css"

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mode, setMode] = useState<"login" | "register">(defaultMode)

  useEffect(() => {
    setMode(pathname.includes("register") ? "register" : "login")
  }, [pathname])

  const handleClose = () => {
    onClose()
    setTimeout(() => router.back(), 150)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <div className="bg-background rounded-lg">
          <AuthForm mode={mode} onModeChange={setMode} isModal />
        </div>
      </DialogContent>
    </Dialog>
  )
}
