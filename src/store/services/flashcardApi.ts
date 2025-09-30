import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  GetAllFlashListsResponse,
  GetFlashListByIdResponse,
  CreateFlashListRequest,
  CreateFlashListResponse,
  UpdateFlashListRequest,
  DeleteFlashListResponse,
  RateFlashListRequest,
  SearchFlashListParams,
  SearchFlashListResponse,
} from "@/types/flashcard";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include", // Để gửi cookies
  prepareHeaders: (headers) => {
    // Không set Content-Type ở đây để browser tự động set khi có FormData
    return headers;
  },
});

export const flashcardApi = createApi({
  reducerPath: "flashcardApi",
  baseQuery,
  tagTypes: ["FlashList", "FlashCard"],
  endpoints: (builder) => ({
    // Lấy danh sách tất cả FlashList (public + của mình)
    getAllFlashLists: builder.query<
      GetAllFlashListsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/flashcards/get-all-flashlists?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["FlashList"],
    }),

    // Lấy chi tiết FlashList theo ID
    getFlashListById: builder.query<GetFlashListByIdResponse, string>({
      query: (id) => ({
        url: `/flashcards/get-flashlist-detail/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "FlashList", id }],
    }),

    // Tạo FlashList mới
    createFlashList: builder.mutation<
      CreateFlashListResponse,
      CreateFlashListRequest
    >({
      query: (data) => {
        const formData = new FormData();
        formData.append("title", data.title);
        if (data.isPublic !== undefined) {
          formData.append("isPublic", String(data.isPublic));
        }
        if (data.level) {
          formData.append("level", data.level);
        }
        if (data.description) {
          formData.append("description", data.description);
        }
        if (data.thumbnail) {
          formData.append("thumbnail", data.thumbnail);
        }

        return {
          url: "/flashcards/create-flashlist",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["FlashList"],
    }),

    // Cập nhật FlashList
    updateFlashList: builder.mutation<
      CreateFlashListResponse,
      { id: string; data: UpdateFlashListRequest }
    >({
      query: ({ id, data }) => ({
        url: `/flashcards/update-flashlist/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "FlashList", id },
        "FlashList",
      ],
    }),

    // Xóa FlashList
    deleteFlashList: builder.mutation<DeleteFlashListResponse, string>({
      query: (id) => ({
        url: `/flashcards/delete-flashlist/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FlashList"],
    }),

    // Đánh giá FlashList
    rateFlashList: builder.mutation<
      CreateFlashListResponse,
      { id: string; rating: number }
    >({
      query: ({ id, rating }) => ({
        url: `/flashcards/rate/${id}`,
        method: "POST",
        body: { rating },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "FlashList", id },
        "FlashList",
      ],
    }),

    // Lấy dữ liệu học tập từ FlashList
    getStudyDataFromList: builder.query<any, string>({
      query: (id) => ({
        url: `/flashcards/study-flashlist/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "FlashList", id }],
    }),

    // Tìm kiếm FlashList
    searchFlashList: builder.query<SearchFlashListResponse, SearchFlashListParams>({
      query: ({ q, level = "all", select = "all", page = 1, limit = 12 }) => {
        const params = new URLSearchParams({
          q,
          page: String(page),
          limit: String(limit),
        });

        if (level && level !== "all") {
          params.append("level", level);
        }

        if (select && select !== "all") {
          params.append("select", select);
        }

        return {
          url: `/flashcards/search-flashlist?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["FlashList"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllFlashListsQuery,
  useGetFlashListByIdQuery,
  useCreateFlashListMutation,
  useUpdateFlashListMutation,
  useDeleteFlashListMutation,
  useRateFlashListMutation,
  useGetStudyDataFromListQuery,
  useSearchFlashListQuery,
  useLazySearchFlashListQuery,
} = flashcardApi;