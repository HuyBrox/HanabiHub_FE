// src/store/services/authApi.ts
// RTK Query API cho authentication
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfileResponse,
} from "../../types/auth";

console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include", // để gửi cookies
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // ================== LOGIN ==================
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    // ================== LOGOUT ==================
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    // ================== REFRESH TOKEN ==================
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/refresh-token",
        method: "POST",
      }),
    }),

    // ================== GET CURRENT USER ==================
    getCurrentUser: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: "/user/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),

    // ================== SEND OTP (REGISTER) ==================
    sendOtpRegister: builder.mutation<
      { message: string; userId: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/send-otp-register",
        method: "POST",
        body,
      }),
    }),

    // ================== REGISTER ==================
    // ⚠️ Có thể bỏ nếu backend gộp verify + register
    register: builder.mutation<
      { message: string; userId: string },
      RegisterRequest
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body, // { username, email, password, confirmPassword, fullname }
      }),
    }),

    // ================== VERIFY OTP + REGISTER ==================
    verifyOtp: builder.mutation<
      { message: string; token: string },
      {
        email: string;
        otp: string;
        username: string;
        password: string;
        confirmPassword: string;
        fullname: string;
      }
    >({
      query: (body) => ({
        url: "/verify-otp",
        method: "POST",
        body,
      }),
    }),
  }),
});

// RTK Query auto-generate hooks
export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useSendOtpRegisterMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
} = authApi;
