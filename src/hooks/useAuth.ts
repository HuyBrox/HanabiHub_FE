"use client";

import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import { RootState } from "../store";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useSendOtpRegisterMutation,
} from "../store/services/authApi";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  logoutThunk,
  clearError,
} from "../store/slices/authSlice";
import { LoginRequest,RegisterRequest  } from "../types/auth";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // RTK Query mutations
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [registerMutation] = useRegisterMutation();
  const [verifyOtpMutation] = useVerifyOtpMutation();
  const [sendOtpRegisterMutation] = useSendOtpRegisterMutation();

  // ================== LOGIN ==================
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(loginStart());
        const result = await loginMutation(credentials).unwrap();

        if (result?.success && result?.data?.user) {
          dispatch(loginSuccess(result.data.user));
          return { success: true, user: result.data.user };
        }

        const message = result?.message || "Đăng nhập thất bại";
        dispatch(loginFailure(message));
        return { success: false, error: message };
      } catch (err: unknown) {
        const errorMessage =
          (err as any)?.data?.message || "Đăng nhập thất bại";
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, loginMutation]
  );

  // ================== LOGOUT ==================
  const logout = useCallback(async () => {
    // ✅ Sử dụng logoutThunk để gọi backend API và clear cookies
    dispatch(logoutThunk() as any);
  }, [dispatch]);

  // ================== SEND OTP (REGISTER) ==================
  const sendOtp = useCallback(
    async (email: string) => {
      try {
        const result = await sendOtpRegisterMutation({ email }).unwrap();
        return { success: true, data: result };
      } catch (err: unknown) {
        return {
          success: false,
          error: (err as any)?.data?.message || "Gửi OTP thất bại",
        };
      }
    },
    [sendOtpRegisterMutation]
  );

// ================== REGISTER ==================
const register = useCallback(
  async (data: RegisterRequest) => {
    try {
      const result = await registerMutation(data).unwrap();
      return { success: true, data: result };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as any)?.data?.message || "Đăng ký thất bại",
      };
    }
  },
  [registerMutation]
);

  // ================== VERIFY OTP ==================
  const verifyOtp = useCallback(
    async (data: RegisterRequest & { otp: string }) => {
      try {
        const result = await verifyOtpMutation(data).unwrap();
        return { success: true, data: result };
      } catch (err: unknown) {
        return {
          success: false,
          error: (err as any)?.data?.message || "Xác thực OTP thất bại",
        };
      }
    },
    [verifyOtpMutation]
  );

  // ================== CLEAR ERROR ==================
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
//trả về tất cả các state và function liên quan đến auth
//user chứa thông tin user đã đăng nhập
//isAuthenticated là true nếu user đã đăng nhập
//isLoading là true nếu đang loading
//error là lỗi nếu có
//login là function để đăng nhập
//logout là function để đăng xuất
//clearError là function để clear lỗi
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    sendOtp,
    register,
    verifyOtp,
    clearError: clearAuthError, // rename để dễ phân biệt
  };
};
