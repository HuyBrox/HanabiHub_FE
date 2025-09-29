"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthFormProps } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/components/notification";
import styles from "./AuthForm.module.css";

export function AuthForm({
  mode,
  onModeChange,
  isModal = false,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  }>({});

  const [localError, setLocalError] = useState<string | null>(null);

  const { login, isLoading, isAuthenticated } = useAuth();
  const { success } = useNotification();
  const router = useRouter();

  // Clear error khi chuyển mode
  useEffect(() => {
    setFieldErrors({});
    setLocalError(null);
  }, [mode]);

  // Chỉ redirect sau khi login thành công và không phải modal
  useEffect(() => {
    if (isAuthenticated && !isModal) {
      try {
        success("Đăng nhập thành công", { title: "Thành công" });
      } catch (e) {}
      try {
        router.push("/");
      } catch (e) {
        try {
          window.location.assign("/");
        } catch (e) {}
      }
    }
  }, [isAuthenticated, isModal, router]);

  // Validation functions với useCallback để tránh re-create
  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email) return "Email là bắt buộc";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Email không hợp lệ";
    return undefined;
  }, []);

  const validatePassword = useCallback(
    (password: string): string | undefined => {
      if (!password) return "Mật khẩu là bắt buộc";
      if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
      return undefined;
    },
    []
  );

  const validateName = useCallback(
    (name: string): string | undefined => {
      if (mode === "register" && !name) return "Họ tên là bắt buộc";
      return undefined;
    },
    [mode]
  );

  const validateConfirmPassword = useCallback(
    (confirmPassword: string, password: string): string | undefined => {
      if (mode === "register") {
        if (!confirmPassword) return "Xác nhận mật khẩu là bắt buộc";
        if (confirmPassword !== password) return "Mật khẩu xác nhận không khớp";
      }
      return undefined;
    },
    [mode]
  );

  // Validate form trước khi submit
  const validateForm = useCallback((): boolean => {
    const errors: typeof fieldErrors = {};

    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);
    errors.name = validateName(formData.name);
    errors.confirmPassword = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    // Remove undefined errors
    Object.keys(errors).forEach((key) => {
      if (errors[key as keyof typeof errors] === undefined) {
        delete errors[key as keyof typeof errors];
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    formData,
    validateEmail,
    validatePassword,
    validateName,
    validateConfirmPassword,
  ]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setLocalError(null); // Clear local error

      // Validate form
      if (!validateForm()) {
        return;
      }

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
      }
    },
    [mode, formData, validateForm, login, isModal]
  );

  const handleModeSwitch = useCallback(
    (newMode: "login" | "register") => {
      onModeChange(newMode);
    },
    [onModeChange]
  );

  // Optimized input handlers
  const handleInputChange = useCallback(
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const handleNameChange = useMemo(
    () => handleInputChange("name"),
    [handleInputChange]
  );
  const handleEmailChange = useMemo(
    () => handleInputChange("email"),
    [handleInputChange]
  );
  const handlePasswordChange = useMemo(
    () => handleInputChange("password"),
    [handleInputChange]
  );
  const handleConfirmPasswordChange = useMemo(
    () => handleInputChange("confirmPassword"),
    [handleInputChange]
  );

  return (
    <Card
      key="auth-form" // Stable key để tránh re-mount
      className={cn(
        "w-full transition-all duration-500 ease-in-out transform",
        isModal && "border-0 shadow-none"
      )}
    >
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">
              日
            </span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          {mode === "login" ? "Welcome back" : "Create account"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to continue your Japanese learning journey"
            : "Start your Japanese learning adventure today"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error message */}
        {localError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{localError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field for register mode */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              mode === "register" ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={cn(
                    "pl-10",
                    fieldErrors.name &&
                      "border-red-500 focus:ring-red-500 focus:border-red-500"
                  )}
                  value={formData.name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={cn(
                  "pl-10",
                  fieldErrors.email &&
                    "border-red-500 focus:ring-red-500 focus:border-red-500"
                )}
                value={formData.email}
                onChange={handleEmailChange}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={cn(
                  "pl-10 pr-10",
                  fieldErrors.password &&
                    "border-red-500 focus:ring-red-500 focus:border-red-500"
                )}
                value={formData.password}
                onChange={handlePasswordChange}
                disabled={isLoading}
              />
              <Button type="button" variant="ghost" size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password field for register mode */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              mode === "register" ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
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
                  className={cn(
                    "pl-10",
                    fieldErrors.confirmPassword &&
                      "border-red-500 focus:ring-red-500 focus:border-red-500"
                  )}
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
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
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </p>
          <Button type="button" variant="link"
            className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
            onClick={() =>
              handleModeSwitch(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login" ? "Create one now" : "Sign in instead"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
