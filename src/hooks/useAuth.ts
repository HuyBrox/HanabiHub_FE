"use client";

import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo } from "react";
import { RootState } from "../store";
import {
  useLoginMutation,
  useGoogleLoginMutation,
} from "../store/services/authApi";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutThunk,
  clearError,
} from "../store/slices/authSlice";
import { LoginRequest } from "../types/auth";

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  // Destructure in useMemo để tránh unnecessary re-renders
  const { user, isAuthenticated, isLoading, error, isInitialized } = useMemo(
    () => authState,
    [authState]
  );

  const [loginMutation] = useLoginMutation();
  const [googleLoginMutation] = useGoogleLoginMutation();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(loginStart());
        const result = await loginMutation(credentials).unwrap();

        if (result.success && result.data) {
          // Save access token for subsequent API calls that expect Authorization header
          try {
            if (typeof window !== "undefined" && result.data.accessToken) {
              localStorage.setItem("access_token", result.data.accessToken);
            }
          } catch (e) {}

          dispatch(loginSuccess(result.data.user));
          return { success: true, user: result.data.user };
        } else {
          dispatch(loginFailure(result.message));
          return { success: false, error: result.message };
        }
      } catch (error: any) {
        const errorMessage = error?.data?.message || "Đăng nhập thất bại";
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, loginMutation]
  );

  const googleLogin = useCallback(
    async (token: string, isAccessToken: boolean = false) => {
      try {
        dispatch(loginStart());
        const body = isAccessToken
          ? { accessToken: token }
          : { idToken: token };
        const result = await googleLoginMutation(body).unwrap();

        if (result.success && result.data) {
          dispatch(loginSuccess(result.data.user));
          return { success: true, user: result.data.user };
        } else {
          dispatch(loginFailure(result.message));
          return { success: false, error: result.message };
        }
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || "Đăng nhập Google thất bại";
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, googleLoginMutation]
  );

  const handleLogout = useCallback(async () => {
    // ✅ Sử dụng logoutThunk để gọi backend API và clear cookies
    dispatch(logoutThunk() as any);
  }, [dispatch]);

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
    isInitialized,
    login,
    googleLogin,
    logout: handleLogout,
    clearError: clearAuthError,
  };
};
