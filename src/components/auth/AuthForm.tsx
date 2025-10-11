"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  AlertCircle,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { AuthFormProps } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/components/notification";

export function AuthForm({ mode, onModeChange, isModal = false }: AuthFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullname: "",
    confirmPassword: "",
    otp: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login, sendOtp, verifyOtp, isLoading, isAuthenticated } = useAuth();
  const { success } = useNotification();
  const router = useRouter();

  // Reset khi đổi mode
  useEffect(() => {
    setErrors({});
    setLocalError(null);
    setStep("form");
  }, [mode]);

  // Redirect khi login thành công
  useEffect(() => {
    if (isAuthenticated && !isModal) {
      success("Đăng nhập thành công", { title: "Thành công" });
      router.push("/");
    }
  }, [isAuthenticated, isModal, router, success]);

  // Validate
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email là bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
    else if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải ≥ 6 ký tự";

    if (mode === "register") {
      if (!formData.username) newErrors.username = "Tên đăng nhập là bắt buộc";
      if (!formData.fullname) newErrors.fullname = "Họ tên là bắt buộc";
      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
      else if (formData.confirmPassword !== formData.password)
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mode]);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) return;

    if (mode === "login") {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      if (!result.success) {
        setLocalError(result.error || "Đăng nhập thất bại");
      } else if (isModal) {
        window.dispatchEvent(new CustomEvent("auth-success"));
      }
    } else {
      const otpResult = await sendOtp(formData.email);
      if (!otpResult.success) {
        setLocalError(otpResult.error || "Không thể gửi OTP");
        return;
      }
      setStep("otp");
      success("OTP đã được gửi về email", { title: "Vui lòng kiểm tra" });
    }
  };

  // Submit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!otp || otp.length < 6) {
      setLocalError("Vui lòng nhập OTP hợp lệ");
      return;
    }

    const result = await verifyOtp({ ...formData, otp });

    if (!result.success) {
      setLocalError(result.error || "Xác thực OTP thất bại");
    } else {
      success("Tạo tài khoản thành công", { title: "Hoàn tất" });

      if (isModal) {
        // 🔔 Gửi event để AuthModal bắt và tự đóng modal + redirect
        window.dispatchEvent(new CustomEvent("auth-success"));
      } else {
        // 🔁 Nếu không nằm trong modal thì redirect trực tiếp
        router.push("/");
      }
    }
  };

  return (
    <Card className={cn("w-full", isModal && "border-0 shadow-none")}>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {mode === "login"
            ? "Welcome back"
            : step === "form"
              ? "Create account"
              : "Verify OTP"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to continue"
            : step === "form"
              ? "Fill in details to create account"
              : "Enter the 6-digit OTP we sent to your email"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {localError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{localError}</AlertDescription>
          </Alert>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, username: e.target.value }))
                    }
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, fullname: e.target.value }))
                    }
                    placeholder="Enter your full name"
                  />
                  {errors.fullname && (
                    <p className="text-red-500 text-xs">{errors.fullname}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : mode === "login"
                  ? "Sign In"
                  : "Send OTP"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => setOtp(v)}
                className="gap-3"
              >
                <InputOTPGroup className="flex gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-12 h-12 text-xl rounded-lg border"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify & Register"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </p>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-semibold text-primary"
            onClick={() =>
              onModeChange(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login" ? "Create one now" : "Sign in instead"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
