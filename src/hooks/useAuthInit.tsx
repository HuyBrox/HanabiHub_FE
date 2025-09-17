"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery } from "../store/services/authApi";
import { loginSuccess } from "../store/slices/authSlice";
// Update the import path to the correct relative location
import { LoadingPage } from "../components/loading";

/**
 * Hook để khôi phục authentication state khi app khởi động
 * Sử dụng refresh token để kiểm tra xem user có còn logged in không
 */
export const useAuthInit = () => {
  const dispatch = useDispatch();

  // Gọi API để lấy thông tin user hiện tại (nếu có token trong cookie)
  const { data, isSuccess, isError, isLoading } = useGetCurrentUserQuery();

  useEffect(() => {
    if (isSuccess && data?.success && data.data) {
      // Backend trả về user object trực tiếp trong data (không phải data.user)
      dispatch(loginSuccess(data.data));
      console.log("Auth state restored from /user/profile:", data.data);
    } else if (isError) {
      // Nếu API fail (401, 403, etc.), user không authenticated hoặc token expired
      console.log("No valid session found - token may be expired or invalid");
    }
  }, [isSuccess, isError, data, dispatch]);

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
