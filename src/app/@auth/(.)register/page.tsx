"use client"

import { AuthModal } from "@/components/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function RegisterModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => router.back(), 150)
  }

  return <AuthModal isOpen={isOpen} onClose={handleClose} defaultMode="register" />
}
