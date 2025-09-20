"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

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
  redirectTo = "/login",
}) => {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null; // hoặc có thể return fallback
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
