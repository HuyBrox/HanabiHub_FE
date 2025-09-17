"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Nếu đã đăng nhập thì redirect về home
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Nếu đã đăng nhập thì return null để tránh flash content
  if (isAuthenticated) {
    return null;
  }

  // Render form login
  return <AuthPage defaultMode="login" />;
}
