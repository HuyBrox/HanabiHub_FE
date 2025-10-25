import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Dashboard", "Admin", "Activities"],
  endpoints: (builder) => ({
    // 🧭 Lấy dữ liệu tổng quan dashboard
    getStats: builder.query<any, void>({
      query: () => "/admin/dashboard",
      transformResponse: (response: any) => response.data,
      providesTags: ["Dashboard"],
    }),

    // 📘 Lấy danh sách khóa học phổ biến
    getPopularCourses: builder.query<any, void>({
      query: () => "/admin/popular-courses",
      transformResponse: (response: any) => response.data,
      providesTags: ["Dashboard"],
    }),

    // 📋 Lấy hoạt động gần đây
    getRecentActivities: builder.query<any, void>({
      query: () => "/admin/recent-activities",
      transformResponse: (response: any) => response.data,
      providesTags: ["Activities"],
    }),

    // 👤 Tạo admin mới
    createAdmin: builder.mutation({
      query: (adminData: {
        fullname: string;
        email: string;
        username: string;
        password: string;
        level: string;
      }) => ({
        url: "/admin/create-admin",
        method: "POST",
        body: adminData,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["Admin", "Dashboard"],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetPopularCoursesQuery,
  useGetRecentActivitiesQuery,
  useCreateAdminMutation,
} = dashboardApi;

