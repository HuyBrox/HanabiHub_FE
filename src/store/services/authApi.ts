// RTK Query API cho authentication
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  LoginRequest,
  AuthResponse,
  UserProfileResponse,
} from "../../types/auth";

console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include", // Để gửi cookies
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
        fullname: string
        username: string
        email: string
        password: string
        confirmPassword: string   // 👈 thêm confirmPassword
        Otp: string
      }
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
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
} = authApi;
