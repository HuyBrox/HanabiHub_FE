// RTK Query API cho authentication
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  LoginRequest,
  AuthResponse,
  UserProfileResponse,
} from "../../types/auth";

console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);

// Custom baseQuery với better error handling và logging
const baseQueryWithLogging = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include", // Để gửi cookies
  prepareHeaders: (headers, { endpoint }) => {
    headers.set("Content-Type", "application/json");
    
    // Log cookies trong development hoặc khi có lỗi
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      const cookies = document.cookie;
      if (cookies) {
        console.log(`[${endpoint}] Cookies available:`, cookies.split(";").length, "cookies");
      } else {
        console.warn(`[${endpoint}] No cookies found`);
      }
    }
    
    return headers;
  },
});

// Wrap baseQuery để log responses và errors
const baseQuery = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithLogging(args, api, extraOptions);
  
  // Log 401 errors với thông tin về cookies
  if (result.error && (result.error as any).status === 401) {
    if (typeof window !== "undefined") {
      const cookies = document.cookie;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const isCrossOrigin = apiUrl && !apiUrl.includes(window.location.hostname);
      
      console.error("[Auth API] 401 Unauthorized:", {
        endpoint: args?.url || args,
        hasCookies: !!cookies,
        cookieCount: cookies ? cookies.split(";").filter(c => c.trim()).length : 0,
        isCrossOrigin,
        apiUrl,
        currentOrigin: window.location.origin,
        isIncognito: navigator.userAgent.includes("Incognito") || 
                    (window as any).chrome?.runtime?.onConnect === undefined && 
                    navigator.userAgent.includes("Chrome"),
      });
      
      // Nếu là cross-origin và không có cookies, có thể là vấn đề với SameSite
      if (isCrossOrigin && !cookies) {
        console.error(
          "[Auth API] ⚠️ Cross-origin request without cookies. " +
          "Backend must set cookies with SameSite=None; Secure for cross-origin requests."
        );
      }
    }
  }
  
  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // API đăng nhập
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    // API đăng xuất
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    // API refresh token
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/refresh-token",
        method: "POST",
      }),
    }),
    // API lấy thông tin user hiện tại
    getCurrentUser: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: "/user/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    // Gửi OTP để đăng ký
    sendOtpRegister: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: "/send-otp-register",
        method: "POST",
        body,
      }),
    }),
    // Đăng ký tài khoản
    registerUser: builder.mutation<
      any,
      {
        username: string;
        fullname: string;
        email: string;
        password: string;
        confirmPassword: string;
        otp: string;
      }
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),
    // Google OAuth2 login
    googleLogin: builder.mutation<
      AuthResponse,
      { idToken?: string; accessToken?: string }
    >({
      query: (body) => ({
        url: "/google",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});
//rtk query tự generate hooks dựa trên endpoint đã khai báo
export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useSendOtpRegisterMutation,
  useRegisterUserMutation,
  useGoogleLoginMutation,
} = authApi;
