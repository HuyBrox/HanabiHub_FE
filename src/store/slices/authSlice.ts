// Quản lý state authentication của user
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../../types/auth";

// Khôi phục auth state từ localStorage nếu có
const getInitialAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,
    };
  }

  try {
    const savedAuth = localStorage.getItem("auth_state");
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      return {
        ...parsed,
        isLoading: false, // Reset loading state
        error: null, // Clear any previous errors
        isInitialized: false, // Will be set to true after auth check
      };
    }
  } catch (error) {
    console.warn("Failed to parse saved auth state:", error);
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
  };
};

const initialState: AuthState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Bắt đầu quá trình đăng nhập
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Đăng nhập thành công, lưu thông tin user
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.isInitialized = true;

      // Lưu vào localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("auth_state", JSON.stringify({
            user: action.payload,
            isAuthenticated: true,
            isInitialized: true,
          }));
        } catch (error) {
          console.warn("Failed to save auth state:", error);
        }
      }
    },
    // Đăng nhập thất bại, lưu lỗi
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
      state.isInitialized = true;

      // Xóa khỏi localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_state");
      }
    },
    // Đăng xuất, reset toàn bộ state
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.isInitialized = true;

      // Xóa khỏi localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_state");
      }
    },
    // Đánh dấu auth đã được khởi tạo
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;
