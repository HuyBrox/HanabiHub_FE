// src/store/services/reportApi.ts
// ✅ RTK Query API for Report Management
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ==================== TYPES ====================
export interface ReportItem {
  _id: string;
  reason: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  reporter: {
    name: string;
    email: string;
  };
  reportedUser: {
    name: string;
    email: string;
  };
  adminNote?: string;
  createdAt: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  highPriority: number;
}

export interface GetReportsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface ReportListResponse {
  success: boolean;
  data: ReportItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportResponse {
  success: boolean;
  data: ReportItem;
  message?: string;
}

export interface ReportStatsResponse {
  success: boolean;
  data: ReportStats;
}

export interface ReportActionRequest {
  adminNote: string;
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
export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery,
  tagTypes: ["Reports", "ReportStats"],
  endpoints: (builder) => ({
    // ================== GET REPORTS LIST ==================
    getReportsList: builder.query<ReportListResponse, GetReportsParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);

        return {
          url: `/reports?${queryParams.toString()}`,
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
      providesTags: ["Reports"],
    }),

    // ================== APPROVE REPORT ==================
    approveReport: builder.mutation<ReportResponse, { id: string; data: ReportActionRequest }>({
      query: ({ id, data }) => ({
        url: `/reports/${id}/approve`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Reports", "ReportStats"],
    }),

    // ================== REJECT REPORT ==================
    rejectReport: builder.mutation<ReportResponse, { id: string; data: ReportActionRequest }>({
      query: ({ id, data }) => ({
        url: `/reports/${id}/reject`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Reports", "ReportStats"],
    }),

    // ================== GET REPORT STATS ==================
    getReportStats: builder.query<ReportStatsResponse, void>({
      query: () => ({
        url: "/reports/stats",
        method: "GET",
      }),
      providesTags: ["ReportStats"],
    }),

    // ================== EXPORT REPORTS ==================
    exportReports: builder.query<Blob, "excel" | "csv">({
      query: (format = "excel") => ({
        url: `/reports/export?format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useGetReportsListQuery,
  useApproveReportMutation,
  useRejectReportMutation,
  useGetReportStatsQuery,
  useLazyExportReportsQuery,
} = reportApi;
