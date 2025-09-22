"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "../store/services/authApi";
import { loginSuccess, logout } from "../store/slices/authSlice";
import { RootState } from "../store";
// Update the import path to the correct relative location
import { LoadingPage } from "../components/loading";

// Hook để khôi phục authentication state khi app khởi động và theo dõi session
export const useAuthInit = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Gọi API để lấy thông tin user hiện tại (nếu có token trong cookie)
  const { data, isSuccess, isError, isLoading, refetch, error } =
    useGetCurrentUserQuery();

  useEffect(() => {
    if (isSuccess && data?.success && data.data) {
      // Backend trả về user object trực tiếp trong data
      dispatch(loginSuccess(data.data));
      console.log("✅ Auth state restored from /user/profile:", data.data);
    } else if (isError) {
      // Nếu API fail, logout nếu đang authenticated
      const errorStatus = (error as any)?.status;
      if (errorStatus === 401 || errorStatus === 403) {
        if (isAuthenticated) {
          console.log("🔓 Session expired, logging out...");
          dispatch(logout());
        }
      }
      console.log(
        "❌ No valid session found - token may be expired or invalid"
      );
    }
  }, [isSuccess, isError, data, dispatch, isAuthenticated, error]);

  // Theo dõi khi user quay lại tab để check session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // User quay lại tab và đang authenticated, check lại session
        console.log("👁️ User returned to tab, checking session...");
        refetch();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        // User focus vào window và đang authenticated, check lại session
        console.log("🎯 Window focused, checking session...");
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch, isAuthenticated]);

  // Periodic check session mỗi 10 phút nếu đang authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      console.log("⏰ Periodic session check...");
      refetch();
    }, 10 * 60 * 1000); // 10 phút

    return () => clearInterval(interval);
  }, [refetch, isAuthenticated]);

  return { isLoading };
};

/**
 * Component wrapper để init auth state
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoading } = useAuthInit();

  // Hiển thị loading khi đang kiểm tra auth state
  if (isLoading) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};
