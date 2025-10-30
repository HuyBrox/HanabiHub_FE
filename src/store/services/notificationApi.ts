// src/store/services/notificationApi.ts
// ✅ RTK Query API for Notification Management
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ==================== TYPES ====================
export interface NotificationRequest {
  title: string;
  message: string;
  type: "system" | "personal" | "maintenance" | "course" | "security" | "contest";
  recipientIds?: string[];
}

export interface NotificationHistory {
  _id: string;
  title: string;
  content: string; // Backend uses 'content' not 'message'
  type: "system" | "personal";
  receivers: string[]; // Array of user IDs
  isSystem: boolean;
  readCount: number; // Number of users who read
  unreadCount: number; // Number of users who haven't read
  totalReceivers: number; // Total target users
  readBy: string[]; // Array of user IDs who read
  sender?: { _id: string; fullname: string; username: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  system: number;
  personal: number;
  totalRecipients: number;
}

export interface GetNotificationHistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
}

export interface NotificationListResponse {
  success: boolean;
  data: NotificationHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationResponse {
  success: boolean;
  data: NotificationHistory;
  message?: string;
}

export interface NotificationStatsResponse {
  success: boolean;
  data: NotificationStats;
}

export interface UpdateNotificationRequest {
  title?: string;
  content?: string;
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
export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery,
  tagTypes: ["Notifications", "NotificationStats"],
  endpoints: (builder) => ({
    // ================== SEND SYSTEM NOTIFICATION ==================
    sendSystemNotification: builder.mutation<NotificationResponse, NotificationRequest>({
      query: (data) => ({
        url: "/notifications/send-system",
        method: "POST",
        body: {
          title: data.title,
          content: data.message, // Backend expects "content"
        },
      }),
      invalidatesTags: ["Notifications", "NotificationStats"],
    }),

    // ================== SEND SPECIFIC NOTIFICATION ==================
    sendSpecificNotification: builder.mutation<NotificationResponse, NotificationRequest>({
      query: (data) => ({
        url: "/notifications/send-specific",
        method: "POST",
        body: {
          title: data.title,
          content: data.message, // Backend expects "content"
          userIds: data.recipientIds, // Backend expects "userIds"
        },
      }),
      invalidatesTags: ["Notifications", "NotificationStats"],
    }),

    // ================== GET NOTIFICATION HISTORY ==================
    getNotificationHistory: builder.query<NotificationListResponse, GetNotificationHistoryParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.type) queryParams.append("type", params.type);
        if (params.fromDate) queryParams.append("fromDate", params.fromDate);
        if (params.toDate) queryParams.append("toDate", params.toDate);

        return {
          url: `/notifications/history?${queryParams.toString()}`,
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
      providesTags: ["Notifications"],
    }),

    // ================== GET NOTIFICATION STATS ==================
    getNotificationStats: builder.query<NotificationStatsResponse, void>({
      query: () => ({
        url: "/notifications/stats",
        method: "GET",
      }),
      providesTags: ["NotificationStats"],
    }),

    // ================== UPDATE NOTIFICATION ==================
    updateNotification: builder.mutation<NotificationResponse, { id: string; data: UpdateNotificationRequest }>({
      query: ({ id, data }) => ({
        url: `/notifications/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // ================== DELETE NOTIFICATION ==================
    deleteNotification: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "NotificationStats"],
    }),

    // ================== EXPORT NOTIFICATION HISTORY ==================
    exportNotificationHistory: builder.query<Blob, "excel" | "csv">({
      query: (format = "excel") => ({
        url: `/notifications/export?format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useSendSystemNotificationMutation,
  useSendSpecificNotificationMutation,
  useGetNotificationHistoryQuery,
  useGetNotificationStatsQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useLazyExportNotificationHistoryQuery,
} = notificationApi;
