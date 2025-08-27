"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthFormProps {
  mode: "login" | "register"
  onModeChange: (mode: "login" | "register") => void
  isModal?: boolean
}

export function AuthForm({ mode, onModeChange, isModal = false }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const handleModeSwitch = (newMode: "login" | "register") => {
    onModeChange(newMode)
  }

  return (
    <Card className={cn("w-full transition-all duration-500 ease-in-out transform", isModal && "border-0 shadow-none")}>
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">日</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create account"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to continue your Japanese learning journey"
            : "Start your Japanese learning adventure today"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field for register mode */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              mode === "register" ? "max-h-20 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm Password field for register mode */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              mode === "register" ? "max-h-20 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Mode switch */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
            onClick={() => handleModeSwitch(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create one now" : "Sign in instead"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
