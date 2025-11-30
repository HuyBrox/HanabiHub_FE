"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Key,
} from "lucide-react";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { AuthFormProps } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/components/notification";
import styles from "./AuthForm.module.css";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useSendOtpRegisterMutation,
  useRegisterUserMutation,
} from "@/store/services/authApi";

export function AuthForm({
  mode,
  onModeChange,
  isModal = false,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullname: "",
    confirmPassword: "",
    otp: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
    fullname?: string;
    confirmPassword?: string;
  }>({});

  const [localError, setLocalError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, googleLogin, isLoading, isAuthenticated } = useAuth();
  const { success, error: notifyError } = useNotification();
  const router = useRouter();

  // RTK Query hooks
  const [sendOtpRegister, { isLoading: isSendingOtp }] =
    useSendOtpRegisterMutation();
  const [registerUser, { isLoading: isRegistering }] =
    useRegisterUserMutation();

  // Clear error khi chuyển mode
  useEffect(() => {
    setFieldErrors({});
    setLocalError(null);
    setOtpSent(false);
    setFormData({
      email: "",
      password: "",
      username: "",
      fullname: "",
      confirmPassword: "",
      otp: "",
    });
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

  const handleGoogleSignIn = useCallback(
    async (response: any) => {
      if (!response.credential) {
        notifyError("Không thể lấy thông tin từ Google", { title: "Lỗi" });
        return;
      }

      setIsGoogleLoading(true);
      setLocalError(null);

      try {
        const result = await googleLogin(response.credential);
        if (result.success) {
          success("Đăng nhập Google thành công", { title: "Thành công" });
          if (isModal) {
            window.dispatchEvent(new CustomEvent("auth-success"));
          }
        } else {
          setLocalError(result.error || "Đăng nhập Google thất bại");
          notifyError(result.error || "Đăng nhập Google thất bại", {
            title: "Lỗi",
          });
        }
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || error?.message || "Đăng nhập Google thất bại";
        setLocalError(errorMessage);
        notifyError(errorMessage, { title: "Lỗi" });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [googleLogin, success, notifyError, isModal]
  );

  // Initialize Google Sign-In when script loads
  useEffect(() => {
    const initGoogleSignIn = () => {
      if (
        typeof window !== "undefined" &&
        (window as any).google &&
        mode === "login"
      ) {
        (window as any).google.accounts.id.initialize({
          client_id:
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
          callback: handleGoogleSignIn,
        });

        // Render button after script loads
        const buttonContainer = document.getElementById("google-signin-button");
        if (buttonContainer && buttonContainer.children.length === 0) {
          try {
            (window as any).google.accounts.id.renderButton(buttonContainer, {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signin_with",
              locale: "vi",
            });
          } catch (error) {
            console.error("Error rendering Google button:", error);
          }
        }
      }
    };

    // Try to initialize immediately if script already loaded
    if (typeof window !== "undefined" && (window as any).google) {
      initGoogleSignIn();
    }

    // Also listen for script load event
    const checkGoogle = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).google) {
        initGoogleSignIn();
        clearInterval(checkGoogle);
      }
    }, 100);

    return () => clearInterval(checkGoogle);
  }, [mode, handleGoogleSignIn]);

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

  const validateUsername = useCallback(
    (username: string): string | undefined => {
      if (mode === "register" && !username) return "Tên người dùng là bắt buộc";
      if (mode === "register" && username.length < 3)
        return "Tên người dùng phải có ít nhất 3 ký tự";
      if (mode === "register" && username.length > 100)
        return "Tên người dùng không được quá 100 ký tự";
      return undefined;
    },
    [mode]
  );

  const validateFullname = useCallback(
    (fullname: string): string | undefined => {
      if (mode === "register" && !fullname) return "Họ tên là bắt buộc";
      if (mode === "register" && fullname.length > 200)
        return "Họ tên không được quá 200 ký tự";
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
    errors.username = validateUsername(formData.username);
    errors.fullname = validateFullname(formData.fullname);
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
    validateUsername,
    validateFullname,
    validateConfirmPassword,
  ]);

  // Hàm gửi OTP
  const handleSendOtp = useCallback(async () => {
    setLocalError(null);

    // Chỉ validate email khi gửi OTP
    // Không check email tồn tại - backend sẽ check sau khi verify OTP
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setFieldErrors({ email: emailError });
      setLocalError(emailError);
      return;
    }

    try {
      const result = await sendOtpRegister({ email: formData.email }).unwrap();
      success("OTP đã được gửi đến email của bạn", { title: "Thành công" });
      setOtpSent(true);
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "Không thể gửi OTP";
      setLocalError(errorMessage);
      notifyError(errorMessage, { title: "Lỗi" });
    }
  }, [formData.email, sendOtpRegister, validateEmail, success, notifyError]);

  // Hàm xác thực OTP và đăng ký
  const handleVerifyAndRegister = useCallback(async () => {
    setLocalError(null);

    // Validate OTP
    if (!formData.otp || formData.otp.length !== 6) {
      setLocalError("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    // Validate toàn bộ form trước khi đăng ký
    // Backend sẽ check email/username tồn tại sau khi verify OTP
    if (!validateForm()) {
      setLocalError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const result = await registerUser({
        username: formData.username,
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        otp: formData.otp,
      }).unwrap();

      success("Đăng ký thành công! Vui lòng đăng nhập.", {
        title: "Thành công",
      });

      // Chuyển về màn hình login
      setOtpSent(false);
      setFormData({
        email: "",
        password: "",
        username: "",
        fullname: "",
        confirmPassword: "",
        otp: "",
      });
      onModeChange("login");
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "Đăng ký thất bại";
      setLocalError(errorMessage);
      notifyError(errorMessage, { title: "Lỗi" });
    }
  }, [formData, registerUser, success, notifyError, onModeChange]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setLocalError(null); // Clear local error

      if (mode === "login") {
        // Validate form cho login
        if (!validateForm()) {
          return;
        }
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          setLocalError(result.error || "Đăng nhập thất bại");
        } else if (isModal) {
          window.dispatchEvent(new CustomEvent("auth-success"));
        }
      } else if (mode === "register") {
        // Nếu chưa gửi OTP, chỉ validate email và gửi OTP
        if (!otpSent) {
          // Chỉ validate email khi gửi OTP
          const emailError = validateEmail(formData.email);
          if (emailError) {
            setFieldErrors({ email: emailError });
            setLocalError(emailError);
            return;
          }
          await handleSendOtp();
        } else {
          // Nếu đã gửi OTP, validate toàn bộ form và đăng ký
          if (!validateForm()) {
            setLocalError("Vui lòng điền đầy đủ thông tin");
            return;
          }
          await handleVerifyAndRegister();
        }
      }
    },
    [
      mode,
      formData,
      validateForm,
      validateEmail,
      login,
      isModal,
      otpSent,
      handleSendOtp,
      handleVerifyAndRegister,
    ]
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

  const handleUsernameChange = useMemo(
    () => handleInputChange("username"),
    [handleInputChange]
  );
  const handleFullnameChange = useMemo(
    () => handleInputChange("fullname"),
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

  const handleOtpChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, otp: value }));
  }, []);

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
          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
            <Image
              src="/images/logos/logohanabi.png"
              alt="HanabiHub Logo"
              width={48}
              height={48}
              className="object-contain"
            />
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
          {/* Username field for register mode */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              mode === "register" && !otpSent
                ? "max-h-24 opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className={cn(
                    "pl-10",
                    fieldErrors.username &&
                      "border-red-500 focus:ring-red-500 focus:border-red-500"
                  )}
                  value={formData.username}
                  onChange={handleUsernameChange}
                  disabled={isLoading || isSendingOtp || isRegistering}
                />
              </div>
              {fieldErrors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.username}
                </p>
              )}
            </div>
          </div>

          {/* Fullname field for register mode */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              mode === "register" && !otpSent
                ? "max-h-24 opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Enter your full name"
                  className={cn(
                    "pl-10",
                    fieldErrors.fullname &&
                      "border-red-500 focus:ring-red-500 focus:border-red-500"
                  )}
                  value={formData.fullname}
                  onChange={handleFullnameChange}
                  disabled={isLoading || isSendingOtp || isRegistering}
                />
              </div>
              {fieldErrors.fullname && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.fullname}
                </p>
              )}
            </div>
          </div>

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
                disabled={
                  isLoading ||
                  isSendingOtp ||
                  isRegistering ||
                  (mode === "register" && otpSent)
                }
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
                disabled={
                  isLoading ||
                  isSendingOtp ||
                  isRegistering ||
                  (mode === "register" && otpSent)
                }
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
              mode === "register" && !otpSent
                ? "max-h-24 opacity-100"
                : "max-h-0 opacity-0"
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
                  disabled={isLoading || isSendingOtp || isRegistering}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* OTP field - hiện sau khi gửi OTP thành công */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              mode === "register" && otpSent
                ? "max-h-40 opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP Code</Label>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a 6-digit code to {formData.email}
              </p>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleOtpChange}
                  disabled={isRegistering}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
              >
                {isSendingOtp ? "Sending..." : "Resend OTP"}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading || isSendingOtp || isRegistering}
          >
            {isLoading || isSendingOtp || isRegistering ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {mode === "login"
                  ? "Signing in..."
                  : otpSent
                  ? "Verifying..."
                  : "Sending OTP..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {mode === "login"
                  ? "Sign In"
                  : otpSent
                  ? "Verify & Register"
                  : "Send OTP"}
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Google Sign-In Button - chỉ hiện khi login mode */}
        {mode === "login" && (
          <>
            <Script
              src="https://accounts.google.com/gsi/client"
              strategy="afterInteractive"
              onLoad={() => {
                if (typeof window !== "undefined" && (window as any).google) {
                  (window as any).google.accounts.id.initialize({
                    client_id:
                      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
                      "YOUR_GOOGLE_CLIENT_ID",
                    callback: handleGoogleSignIn,
                  });

                  // Render button after script loads
                  setTimeout(() => {
                    const buttonContainer = document.getElementById(
                      "google-signin-button"
                    );
                    if (
                      buttonContainer &&
                      buttonContainer.children.length === 0
                    ) {
                      try {
                        (window as any).google.accounts.id.renderButton(
                          buttonContainer,
                          {
                            theme: "outline",
                            size: "large",
                            width: "100%",
                            text: "signin_with",
                            locale: "vi",
                          }
                        );
                      } catch (error) {
                        console.error("Error rendering Google button:", error);
                      }
                    }
                  }, 100);
                }
              }}
            />
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>
            {/* Google button container - Google sẽ render button vào đây */}
            <div
              id="google-signin-button"
              className="w-full flex justify-center"
            ></div>
          </>
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
