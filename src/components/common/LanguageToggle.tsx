"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { Languages } from "lucide-react"
import { LanguageToggleProps } from "@/types/common"
import styles from "./LanguageToggle.module.css"

export function LanguageToggle({ collapsed = false }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "vi" : "en")
  }

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLanguage}
        className="h-9 w-9 hover:bg-orange-100 dark:hover:bg-orange-900/20"
        title={language === "en" ? "Switch to Vietnamese" : "Chuyển sang tiếng Anh"}
      >
        <Languages className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className="w-full justify-start gap-3 hover:bg-orange-100 dark:hover:bg-orange-900/20"
    >
      <Languages className="h-5 w-5" />
      <span className="text-sm font-medium">{language === "en" ? "VI" : "EN"}</span>
    </Button>
  )
}
