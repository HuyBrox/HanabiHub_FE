"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useNotification } from "@/components/notification/NotificationProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component để bảo vệ route - chỉ cho phép user đã đăng nhập truy cập
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/",
}) => {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const { warning } = useNotification();
  const [hasRedirected, setHasRedirected] = useState(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected) {
      // Tránh thông báo lặp do StrictMode/multiple mounts
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        try {
          sessionStorage.setItem("auth_login_notice", "1");
        } catch {}
        // Hiển thị notification trước khi redirect
        warning("Vui lòng đăng nhập để truy cập trang này", {
          duration: 3000,
          title: "Yêu cầu đăng nhập",
        });
      }
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, warning, hasRedirected]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    // Hiển thị UI tạm trong lúc chuyển hướng về trang chủ
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <h2 className="mb-1 text-lg font-semibold">Đang chuyển hướng…</h2>
          <p className="text-sm text-muted-foreground">
            Vui lòng đăng nhập để tiếp tục. Đang đưa bạn về trang chủ.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * HOC để wrap component cần bảo vệ
 */
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  }
) {
  const AuthenticatedComponent = (props: T) => {
    return (
      <ProtectedRoute
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;

  return AuthenticatedComponent;
}

/**
 * Component ngược lại - chỉ hiển thị khi user CHƯA đăng nhập
 */
export const GuestRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/",
}) => {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
