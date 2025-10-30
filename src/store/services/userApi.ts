// src/store/services/userApi.ts
// ✅ RTK Query API for User Management
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ==================== TYPES ====================
export interface UserItem {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  role: "admin" | "premium" | "basic";
  avatar?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface UserStats {
  total: number;
  admin: number;
  premium: number;
  basic: number;
}

export interface UserListResponse {
  success: boolean;
  data: UserItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

// ==================== BASE QUERY ====================
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include", // Cookie authentication
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// ==================== RTK QUERY API ====================
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery,
  tagTypes: ["Users", "UserStats"],
  endpoints: (builder) => ({
    // ================== GET USERS LIST ==================
    getUsersList: builder.query<UserListResponse, UserListParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.role) queryParams.append("role", params.role);

        return {
          url: `/user/search?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        // Transform backend response to expected format
        if (response.success && response.data) {
          const { users, total, page, limit } = response.data;
          return {
            success: true,
            data: users || [],
            pagination: {
              page: page || 1,
              limit: limit || 20,
              total: total || 0,
              totalPages: Math.ceil((total || 0) / (limit || 20)),
            },
          };
        }
        return response;
      },
      providesTags: ["Users"],
    }),

    // ================== SEARCH USERS ==================
    // Note: This is the same as getUsersList in the original implementation
    searchUsers: builder.query<UserListResponse, UserListParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.role) queryParams.append("role", params.role);

        return {
          url: `/user/search?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        // Transform backend response to expected format
        if (response.success && response.data) {
          const { users, total, page, limit } = response.data;
          return {
            success: true,
            data: users || [],
            pagination: {
              page: page || 1,
              limit: limit || 20,
              total: total || 0,
              totalPages: Math.ceil((total || 0) / (limit || 20)),
            },
          };
        }
        return response;
      },
      providesTags: ["Users"],
    }),

    // ================== GET USER STATS ==================
    getUserStats: builder.query<UserStatsResponse, void>({
      query: () => ({
        url: "/user/stats",
        method: "GET",
      }),
      providesTags: ["UserStats"],
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useGetUsersListQuery,
  useSearchUsersQuery,
  useGetUserStatsQuery,
  useLazyGetUsersListQuery,
  useLazySearchUsersQuery,
} = userApi;
