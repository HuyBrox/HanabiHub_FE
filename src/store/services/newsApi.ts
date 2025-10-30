// src/store/services/newsApi.ts
// ✅ RTK Query API for News Management
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ==================== TYPES ====================
export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  image?: string; // Featured image URL
  author: string | { _id: string; fullname: string; username: string };
  status: "published" | "draft";
  views?: number;
  likes?: number;
  comments?: number;
  category?: string;
  tags?: string[];
  publishedAt?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  image?: string; // Base64 or URL
  category?: string;
  tags?: string[];
  status?: "published" | "draft";
  publishedAt?: string; // ISO date string
}

export interface UpdateNewsRequest {
  title?: string;
  content?: string;
  image?: string; // Base64 or URL
  status?: "published" | "draft";
  tags?: string[];
  publishedAt?: string; // ISO date string
}

export interface NewsStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

export interface GetNewsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface NewsListResponse {
  success: boolean;
  data: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NewsResponse {
  success: boolean;
  data: NewsItem;
  message?: string;
}

export interface NewsStatsResponse {
  success: boolean;
  data: NewsStats;
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
export const newsApi = createApi({
  reducerPath: "newsApi",
  baseQuery,
  tagTypes: ["News", "NewsStats"],
  endpoints: (builder) => ({
    // ================== GET NEWS LIST ==================
    getNewsList: builder.query<NewsListResponse, GetNewsListParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);

        return {
          url: `/news?${queryParams.toString()}`,
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
      providesTags: ["News"],
    }),

    // ================== CREATE NEWS ==================
    createNews: builder.mutation<NewsResponse, CreateNewsRequest>({
      query: (data) => ({
        url: "/news",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["News", "NewsStats"],
    }),

    // ================== UPDATE NEWS ==================
    updateNews: builder.mutation<NewsResponse, { id: string; data: UpdateNewsRequest }>({
      query: ({ id, data }) => ({
        url: `/news/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["News", "NewsStats"],
    }),

    // ================== DELETE NEWS ==================
    deleteNews: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/news/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["News", "NewsStats"],
    }),

    // ================== GET NEWS STATS ==================
    getNewsStats: builder.query<NewsStatsResponse, void>({
      query: () => ({
        url: "/news/stats",
        method: "GET",
      }),
      providesTags: ["NewsStats"],
    }),

    // ================== EXPORT NEWS ==================
    exportNews: builder.query<Blob, "excel" | "csv">({
      query: (format = "excel") => ({
        url: `/news/export?format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useGetNewsListQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useGetNewsStatsQuery,
  useLazyExportNewsQuery,
} = newsApi;
