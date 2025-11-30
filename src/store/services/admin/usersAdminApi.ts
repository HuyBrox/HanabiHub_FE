import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8080/api/v1";

/* =============================
   TYPES
============================= */

// Chỉ còn 2 role: admin / user
export type Role = "admin" | "user";

// Trạng thái gồm cả blocked
export type Status = "active" | "inactive" | "blocked";

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  online?: boolean;
  lastLoginAt?: string;
  avatar?: string;
}

export interface ListUsersResponse {
  success: boolean;
  data: AdminUserDTO[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface CreateUserRequest {
  fullname: string;
  email: string;
  password: string;
  role: Role;
  status: Status;
}

export interface CreateUserResponse {
  success: boolean;
  message?: string;
  data: AdminUserDTO;
}

/* =============================
   STATS + METRICS TYPES
============================= */

export interface AdminStatsMetrics {
  users: {
    currentMonth: number;
    previousMonth: number;
    changePercent: number | null;
  };
  admins: {
    currentMonth: number;
    previousMonth: number;
    changePercent: number | null;
  };
  online: {
    changePercent: number | null;
  };
  visits: {
    changePercent: number | null;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    adminCount: number;
    onlineCount: number;
    // số tài khoản bị vô hiệu hóa (inactive)
    visits: number;
    metrics: AdminStatsMetrics;
  };
  message?: string;
}

/* =============================
   API
============================= */

export const usersAdminApi = createApi({
  reducerPath: "usersAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
  }),
  tagTypes: ["AdminUsers", "AdminStats"],
  endpoints: (builder) => ({
    /* ========= LIST ========= */
    listAdminUsers: builder.query<
      ListUsersResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        role?: Role;
        status?: Status;
      }
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        if (params.search) q.set("search", params.search);
        if (params.role) q.set("role", params.role);
        if (params.status) q.set("status", params.status);

        const qs = q.toString();
        return {
          url: `/users.admin/list${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["AdminUsers"],
    }),

    /* ========= CREATE ========= */
    createAdminUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
      query: (body) => ({
        url: `/users.admin/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),

    /* ========= GET BY ID ========= */
    getAdminUserById: builder.query<
      { success: boolean; data: AdminUserDTO },
      string
    >({
      query: (id) => ({
        url: `/users.admin/${id}`,
        method: "GET",
      }),
      providesTags: ["AdminUsers"],
    }),

    /* ========= UPDATE ========= */
    updateAdminUser: builder.mutation<
      { success: boolean; message?: string; data: AdminUserDTO },
      { id: string; body: { fullname?: string; role?: Role; status?: Status } }
    >({
      query: ({ id, body }) => ({
        url: `/users.admin/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),

    /* ========= DELETE HARD ========= */
    deleteAdminUser: builder.mutation<
      { success: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/users.admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),

    /* ========= SOFT DELETE ========= */
    softDeleteAdminUser: builder.mutation<
      { success: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/users.admin/${id}/soft-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),

    /* ========= RESTORE ========= */
    restoreAdminUser: builder.mutation<
      { success: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/users.admin/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),

    /* ========= STATS ========= */
    getAdminStats: builder.query<AdminStatsResponse, void>({
      query: () => ({
        url: `/users.admin/stats`,
        method: "GET",
      }),
      providesTags: ["AdminStats"],
    }),
  }),
});

export const {
  useListAdminUsersQuery,
  useCreateAdminUserMutation,
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useSoftDeleteAdminUserMutation,
  useRestoreAdminUserMutation,
  useGetAdminStatsQuery,
} = usersAdminApi;
