"use client";

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "../store/services/authApi";
import { loginStart, loginSuccess, logoutThunk } from "../store/slices/authSlice";
import { RootState } from "../store";
import { authApi } from "../store/services/authApi";
// Update the import path to the correct relative location
import { LoadingPage } from "../components/loading";

// Hook để khôi phục authentication state khi app khởi động và theo dõi session
export const useAuthInit = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gọi API để lấy thông tin user hiện tại (nếu có token trong cookie)
  const { data, isSuccess, isError, isLoading, refetch, error } =
    useGetCurrentUserQuery();

  // Set loading state khi bắt đầu check auth
  useEffect(() => {
    if (isLoading) {
      dispatch(loginStart());
    }
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (isSuccess && data?.success && data.data) {
      // Backend trả về user object trực tiếp trong data
      dispatch(loginSuccess(data.data));
      console.log("✅ Auth state restored from /user/profile:", data.data);
    } else if (isError) {
      // Nếu API fail, logout
      const errorStatus = (error as any)?.status;
      if (errorStatus === 401 || errorStatus === 403) {
        console.log("🔓 Session expired, logging out...");
        dispatch(logoutThunk() as any);
      } else {
        console.log(
          "❌ No valid session found - token may be expired or invalid"
        );
        dispatch(logoutThunk() as any);
      }
    }
  }, [isSuccess, isError, data, dispatch, error]);

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

  // ✅ PROACTIVE TOKEN REFRESH - Refresh token trước khi hết hạn
  // Access token hết hạn sau 15 phút, refresh sau 12 phút để tránh lỗi
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval nếu user logout
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    console.log("🔄 Setting up proactive token refresh (every 12 minutes)");

    // Refresh ngay lập tức sau 12 phút đầu tiên
    const REFRESH_INTERVAL = 12 * 60 * 1000; // 12 phút (trước khi token 15 phút hết hạn)

    refreshIntervalRef.current = setInterval(() => {
      console.log("⏰ Proactive token refresh triggered...");
      dispatch(authApi.endpoints.refreshToken.initiate() as any);
    }, REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [dispatch, isAuthenticated]);

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
