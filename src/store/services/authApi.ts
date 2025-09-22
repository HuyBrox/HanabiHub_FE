import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  }),
  endpoints: (builder) => ({
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

export const { useSendOtpRegisterMutation, useRegisterUserMutation } = authApi;
