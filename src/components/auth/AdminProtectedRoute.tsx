"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useNotification } from "@/components/notification/NotificationProvider";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component để bảo vệ admin routes - chỉ cho phép admin user truy cập
 */
export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/",
}) => {
  const { isAuthenticated, isLoading, isInitialized, user } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const { error } = useNotification();
  const [hasRedirected, setHasRedirected] = useState(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    // Chỉ xử lý redirect sau khi auth đã được khởi tạo
    if (!isInitialized || isLoading) return;

    // Kiểm tra nếu user không đăng nhập hoặc không phải admin
    if ((!isAuthenticated || !user?.isAdmin) && !hasRedirected) {
      // Tránh thông báo lặp do StrictMode/multiple mounts
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        try {
          sessionStorage.setItem("admin_access_denied", "1");
        } catch {}
        // Hiển thị notification trước khi redirect
        if (!isAuthenticated) {
          error("Vui lòng đăng nhập để truy cập trang quản lý", {
            duration: 3000,
            title: "Yêu cầu đăng nhập",
          });
        } else {
          error(
            "Bạn không có quyền truy cập trang quản lý. Chỉ admin mới được phép.",
            {
              duration: 4000,
              title: "Không có quyền truy cập",
            }
          );
        }
      }
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    router,
    redirectTo,
    error,
    hasRedirected,
  ]);

  // Hiển thị loading nếu đang khởi tạo auth hoặc đang loading
  if (!isInitialized || isLoading) {
    return <>{fallback}</>;
  }

  // Kiểm tra quyền admin
  if (!isAuthenticated || !user?.isAdmin) {
    // Hiển thị UI tạm trong lúc chuyển hướng
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <h2 className="mb-1 text-lg font-semibold">Đang chuyển hướng…</h2>
          <p className="text-sm text-muted-foreground">
            {!isAuthenticated
              ? "Vui lòng đăng nhập để tiếp tục. Đang đưa bạn về trang chủ."
              : "Bạn không có quyền truy cập trang này. Đang đưa bạn về trang chủ."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
