"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "../store/services/authApi";
import { loginSuccess, logout, setInitialized } from "../store/slices/authSlice";
import { RootState } from "../store";
import { LoadingPage } from "@/components/loading";

/**
 * Hook để khôi phục authentication state khi app khởi động
 * Sử dụng refresh token để kiểm tra xem user có còn logged in không
 */
export const useAuthInit = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  // Gọi API để lấy thông tin user hiện tại (nếu có token trong cookie)
  const { data, isSuccess, isError, isLoading, error } = useGetCurrentUserQuery(undefined, {
    // Chỉ gọi API nếu chưa được khởi tạo
    skip: isInitialized,
  });

  useEffect(() => {
    if (isLoading) {
      return; // Đang loading, chưa làm gì
    }

    if (isSuccess && data?.success && data.data) {
      // Backend trả về user object trực tiếp trong data
      dispatch(loginSuccess(data.data));
      console.log("✅ Auth state restored from /user/profile:", data.data);
    } else if (isError) {
      // Nếu API fail (401, 403, etc.), user không authenticated hoặc token expired
      const errorStatus = (error as any)?.status;
      if (errorStatus === 401 || errorStatus === 403) {
        console.log("🔓 Session expired, logging out...");
        dispatch(logout());
      } else {
        console.log("❌ No valid session found - token may be expired or invalid");
        dispatch(logout());
      }
    }

    // Đánh dấu đã khởi tạo xong
    dispatch(setInitialized());
  }, [isSuccess, isError, data, dispatch, error, isLoading]);

  // Nếu đã có auth state từ localStorage và chưa cần gọi API
  if (isAuthenticated && isInitialized) {
    return { isLoading: false };
  }

  return { isLoading: isLoading || !isInitialized };
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
    return React.createElement(LoadingPage);
  }

  return React.createElement(React.Fragment, null, children);
};
