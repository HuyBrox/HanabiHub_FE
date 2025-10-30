// src/store/services/templateApi.ts
// ✅ RTK Query API for Template Management
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ==================== TYPES ====================
export interface TemplateItem {
  _id: string;
  name: string;
  title: string;
  message: string;
  type: "system" | "personal" | "achievement" | "maintenance" | "security" | "course";
  usageCount: number;
  createdAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  title: string;
  message: string;
  type: string;
}

export interface TemplateStats {
  total: number;
  system: number;
  personal: number;
  totalUsage: number;
}

export interface GetTemplatesParams {
  search?: string;
  type?: string;
}

export interface TemplateListResponse {
  success: boolean;
  data: TemplateItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TemplateResponse {
  success: boolean;
  data: TemplateItem;
  message?: string;
}

export interface TemplateStatsResponse {
  success: boolean;
  data: TemplateStats;
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
export const templateApi = createApi({
  reducerPath: "templateApi",
  baseQuery,
  tagTypes: ["Templates", "TemplateStats"],
  endpoints: (builder) => ({
    // ================== GET TEMPLATES LIST ==================
    getTemplatesList: builder.query<TemplateListResponse, GetTemplatesParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.type) queryParams.append("type", params.type);

        return {
          url: `/templates?${queryParams.toString()}`,
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
      providesTags: ["Templates"],
    }),

    // ================== CREATE TEMPLATE ==================
    createTemplate: builder.mutation<TemplateResponse, CreateTemplateRequest>({
      query: (data) => ({
        url: "/templates",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Templates", "TemplateStats"],
    }),

    // ================== UPDATE TEMPLATE ==================
    updateTemplate: builder.mutation<TemplateResponse, { id: string; data: CreateTemplateRequest }>({
      query: ({ id, data }) => ({
        url: `/templates/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Templates", "TemplateStats"],
    }),

    // ================== DELETE TEMPLATE ==================
    deleteTemplate: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Templates", "TemplateStats"],
    }),

    // ================== USE TEMPLATE ==================
    useTemplate: builder.mutation<TemplateResponse, string>({
      query: (id) => ({
        url: `/templates/${id}/use`,
        method: "POST",
      }),
      invalidatesTags: ["Templates", "TemplateStats"],
    }),

    // ================== GET TEMPLATE STATS ==================
    getTemplateStats: builder.query<TemplateStatsResponse, void>({
      query: () => ({
        url: "/templates/stats",
        method: "GET",
      }),
      providesTags: ["TemplateStats"],
    }),

    // ================== EXPORT TEMPLATES ==================
    exportTemplates: builder.query<Blob, "excel" | "csv">({
      query: (format = "excel") => ({
        url: `/templates/export?format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useGetTemplatesListQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useUseTemplateMutation,
  useGetTemplateStatsQuery,
  useLazyExportTemplatesQuery,
} = templateApi;
