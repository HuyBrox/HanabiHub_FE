"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Key } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AuthFormProps } from "@/types/auth"
import { useSendOtpRegisterMutation, useRegisterUserMutation } from "@/store/services/authApi"
import { useToast } from "@/components/ui/use-toast"

export function AuthForm({ mode, onModeChange, isModal = false }: AuthFormProps) {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
    confirmPassword: "",
    otp: "",
    username: "",
  })

  const [sendOtpRegister, { isLoading: isSendingOtp }] = useSendOtpRegisterMutation()
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast({ title: "Lỗi", description: "Email và mật khẩu không được để trống", variant: "destructive" })
      return false
    }
    if (mode === "register") {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" })
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (mode === "register") {
      // Nếu chưa gửi OTP thì gửi OTP
      if (!otpSent) {
        try {
          await sendOtpRegister({ email: formData.email }).unwrap()
          toast({ title: "OTP đã được gửi", description: "Vui lòng kiểm tra email của bạn." })
          setOtpSent(true)
        } catch (error: any) {
          toast({
            title: "Không gửi được OTP",
            description: error?.data?.message || "Vui lòng thử lại",
            variant: "destructive",
          })
        }
        return
      }

      // Nếu đã có OTP thì đăng ký
      if (formData.otp) {
        try {
          await registerUser({
            fullname: formData.fullname,
            username: formData.username || formData.email.split("@")[0], // auto tạo username nếu chưa nhập
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword, // ✅ thêm confirmPassword
            Otp: formData.otp,
          }).unwrap()
          toast({ title: "Đăng ký thành công", description: "Bây giờ bạn có thể đăng nhập." })
          onModeChange("login")
        } catch (error: any) {
          toast({
            title: "Đăng ký thất bại",
            description: error?.data?.message || "OTP không hợp lệ hoặc thông tin chưa chính xác.",
            variant: "destructive",
          })
        }
      }
    } else {
      console.log("TODO: Gọi API login sau khi team hoàn thành login endpoint")
    }
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
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="fullname" placeholder="Enter your full name" className="pl-10"
                  value={formData.fullname} onChange={(e) => handleChange("fullname", e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="Enter your email" className="pl-10"
                value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
          </div>

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
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
              <Button type="button" variant="ghost" size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          {mode === "register" && (
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
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Chỉ hiện OTP sau khi đã gửi OTP */}
          {mode === "register" && otpSent && (
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="otp" placeholder="Nhập OTP đã gửi về email" className="pl-10"
                  value={formData.otp} onChange={(e) => handleChange("otp", e.target.value)} />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSendingOtp || isRegistering}>
            {(isSendingOtp || isRegistering)
              ? <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {mode === "login" ? "Signing in..." : otpSent ? "Registering..." : "Sending OTP..."}
                </div>
              : <div className="flex items-center gap-2">
                  {mode === "login" ? "Sign In" : otpSent ? "Create Account" : "Send OTP"}
                  <ArrowRight className="h-4 w-4" />
                </div>}
          </Button>
        </form>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Button type="button" variant="link"
            className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
            onClick={() => onModeChange(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Create one now" : "Sign in instead"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
