// src/store/services/scheduledNotificationApi.ts
// ✅ RTK Query API for Scheduled Notification Management
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ==================== TYPES ====================
export interface ScheduledNotificationItem {
  _id: string;
  type: "system" | "personal";
  title: string;
  content: string;
  sender: {
    _id: string;
    fullname: string;
    username: string;
  };
  receivers: string[];
  isSystem: boolean;
  scheduledAt: string;
  recurringType: "none" | "daily" | "weekly" | "monthly";
  recurringEndDate?: string;
  status: "pending" | "sent" | "cancelled" | "failed";
  sentAt?: string;
  notificationId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleNotificationRequest {
  title: string;
  content: string;
  userIds?: string[]; // Empty or undefined for system-wide
  scheduledAt: string; // ISO date string
  recurringType?: "none" | "daily" | "weekly" | "monthly";
  recurringEndDate?: string; // ISO date string
}

export interface UpdateScheduledRequest {
  title?: string;
  content?: string;
  scheduledAt?: string;
  recurringType?: "none" | "daily" | "weekly" | "monthly";
  recurringEndDate?: string;
}

export interface ScheduledNotificationStats {
  total: number;
  pending: number;
  sent: number;
  cancelled: number;
  failed: number;
}

export interface GetScheduledParams {
  page?: number;
  limit?: number;
  status?: "pending" | "sent" | "cancelled" | "failed";
}

export interface ScheduledListResponse {
  success: boolean;
  data: ScheduledNotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ScheduledResponse {
  success: boolean;
  data: ScheduledNotificationItem;
  message?: string;
}

export interface ScheduledStatsResponse {
  success: boolean;
  data: ScheduledNotificationStats;
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
export const scheduledNotificationApi = createApi({
  reducerPath: "scheduledNotificationApi",
  baseQuery,
  tagTypes: ["ScheduledNotifications", "ScheduledStats"],
  endpoints: (builder) => ({
    // ================== SCHEDULE NOTIFICATION ==================
    scheduleNotification: builder.mutation<ScheduledResponse, ScheduleNotificationRequest>({
      query: (data) => ({
        url: "/notifications/schedule",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ScheduledNotifications", "ScheduledStats"],
    }),

    // ================== GET SCHEDULED NOTIFICATIONS ==================
    getScheduledNotifications: builder.query<ScheduledListResponse, GetScheduledParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status) queryParams.append("status", params.status);

        return {
          url: `/notifications/scheduled?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        // Transform backend response to expected format
        if (response.success && response.data) {
          const { items, total, page, limit } = response.data;
          return {
            success: true,
            data: items || [],
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
      providesTags: ["ScheduledNotifications"],
    }),

    // ================== UPDATE SCHEDULED NOTIFICATION ==================
    updateScheduledNotification: builder.mutation<ScheduledResponse, { id: string; data: UpdateScheduledRequest }>({
      query: ({ id, data }) => ({
        url: `/notifications/scheduled/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ScheduledNotifications", "ScheduledStats"],
    }),

    // ================== CANCEL SCHEDULED NOTIFICATION ==================
    cancelScheduledNotification: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/notifications/scheduled/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ScheduledNotifications", "ScheduledStats"],
    }),

    // ================== GET SCHEDULED STATS ==================
    getScheduledStats: builder.query<ScheduledStatsResponse, void>({
      query: () => ({
        url: "/notifications/scheduled/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              total: response.data.total || 0,
              pending: response.data.pending || 0,
              sent: response.data.sent || 0,
              cancelled: response.data.cancelled || 0,
              failed: response.data.failed || 0,
            },
          };
        }
        return {
          success: false,
          data: { total: 0, pending: 0, sent: 0, cancelled: 0, failed: 0 },
        };
      },
      providesTags: ["ScheduledStats"],
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useScheduleNotificationMutation,
  useGetScheduledNotificationsQuery,
  useUpdateScheduledNotificationMutation,
  useCancelScheduledNotificationMutation,
  useGetScheduledStatsQuery,
} = scheduledNotificationApi;
