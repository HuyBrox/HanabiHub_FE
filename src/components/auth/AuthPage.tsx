"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { AuthForm } from "./AuthForm"
import { AuthPageProps } from "@/types/auth"
import styles from "./AuthPage.module.css"

export function AuthPage({ defaultMode = "login" }: AuthPageProps) {
  const pathname = usePathname()
  const [mode, setMode] = useState<"login" | "register">(pathname.includes("register") ? "register" : "login")

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  )
}
