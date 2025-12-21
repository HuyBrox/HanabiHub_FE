<<<<<<< HEAD
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  // FlashList
  GetAllFlashListsResponse,
  GetFlashListByIdResponse,
  CreateFlashListRequest,
  CreateFlashListResponse,
  UpdateFlashListRequest,
  DeleteFlashListResponse,
  RateFlashListRequest,
  RateFlashListResponse,
  SearchFlashListParams,
  SearchFlashListResponse,
  // FlashCard
  GetAllFlashCardsResponse,
  GetFlashCardByIdResponse,
  CreateFlashCardRequest,
  CreateFlashCardResponse,
  UpdateFlashCardRequest,
  UpdateFlashCardResponse,
  DeleteFlashCardResponse,
  SearchFlashCardParams,
  SearchFlashCardResponse,
  // Tracking
  TrackFlashcardSessionRequest,
  TrackFlashcardSessionResponse,
  TrackCardLearningRequest,
  TrackCardLearningResponse,
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
      query: ({ page = 1, limit = 20 }) => ({
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
        if (data.flashcards && data.flashcards.length > 0) {
          data.flashcards.forEach((id) => {
            formData.append("flashcards", id);
          });
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
      RateFlashListResponse,
      { id: string; rating: number }
    >({
      query: ({ id, rating }) => ({
        url: `/flashcards/rate-flashlist/${id}`,
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
    searchFlashList: builder.query<
      SearchFlashListResponse,
      SearchFlashListParams
    >({
      query: ({ q, level = "all", select = "all", page = 1, limit = 20 }) => {
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

    // Lấy danh sách tất cả FlashCard của user
    getAllFlashCards: builder.query<
      GetAllFlashCardsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: `/flashcards/get-all-flashcards?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["FlashCard"],
    }),

    // Lấy chi tiết FlashCard theo ID
    getFlashCardById: builder.query<GetFlashCardByIdResponse, string>({
      query: (id) => ({
        url: `/flashcards/get-flashcard-detail/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "FlashCard", id }],
    }),

    // Tạo FlashCard mới
    createFlashCard: builder.mutation<
      CreateFlashCardResponse,
      CreateFlashCardRequest
    >({
      query: (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("cards", JSON.stringify(data.cards));
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
          url: "/flashcards/create-flashcard",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["FlashCard"],
    }),

    // Cập nhật FlashCard
    updateFlashCard: builder.mutation<
      UpdateFlashCardResponse,
      { id: string; data: UpdateFlashCardRequest }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.cards) formData.append("cards", JSON.stringify(data.cards));
        if (data.isPublic !== undefined)
          formData.append("isPublic", String(data.isPublic));
        if (data.level) formData.append("level", data.level);
        if (data.description) formData.append("description", data.description);
        if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

        return {
          url: `/flashcards/update-flashcard/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "FlashCard", id },
        "FlashCard",
      ],
    }),

    // Xóa FlashCard
    deleteFlashCard: builder.mutation<DeleteFlashCardResponse, string>({
      query: (id) => ({
        url: `/flashcards/delete-flashcard/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FlashCard"],
    }),

    // Tìm kiếm FlashCard
    searchFlashCard: builder.query<
      SearchFlashCardResponse,
      SearchFlashCardParams
    >({
      query: ({ q, level = "all", select = "all", page = 1, limit = 20 }) => {
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
          url: `/flashcards/search-flashcard?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["FlashCard"],
    }),

    // Track flashcard session
    trackFlashcardSession: builder.mutation<
      TrackFlashcardSessionResponse,
      TrackFlashcardSessionRequest
    >({
      query: (data) => ({
        url: "/activity/track-flashcard-session",
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    // Track individual card learning
    trackCardLearning: builder.mutation<
      TrackCardLearningResponse,
      TrackCardLearningRequest
    >({
      query: (data) => ({
        url: "/activity/track-card",
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
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
  useGetAllFlashCardsQuery,
  useGetFlashCardByIdQuery,
  useCreateFlashCardMutation,
  useUpdateFlashCardMutation,
  useDeleteFlashCardMutation,
  useSearchFlashCardQuery,
  useLazySearchFlashCardQuery,
  useTrackFlashcardSessionMutation,
  useTrackCardLearningMutation,
} = flashcardApi;
=======
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  // FlashList
  GetAllFlashListsResponse,
  GetFlashListByIdResponse,
  CreateFlashListRequest,
  CreateFlashListResponse,
  UpdateFlashListRequest,
  DeleteFlashListResponse,
  RateFlashListRequest,
  RateFlashListResponse,
  SearchFlashListParams,
  SearchFlashListResponse,
  // FlashCard
  GetAllFlashCardsResponse,
  CreateFlashCardRequest,
  CreateFlashCardResponse,
  SearchFlashCardParams,
  SearchFlashCardResponse,
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
      query: ({ page = 1, limit = 20 }) => ({
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
        if (data.flashcards && data.flashcards.length > 0) {
          data.flashcards.forEach((id) => {
            formData.append("flashcards", id);
          });
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
      RateFlashListResponse,
      { id: string; rating: number }
    >({
      query: ({ id, rating }) => ({
        url: `/flashcards/rate-flashlist/${id}`,
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
    searchFlashList: builder.query<
      SearchFlashListResponse,
      SearchFlashListParams
    >({
      query: ({ q, level = "all", select = "all", page = 1, limit = 20 }) => {
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

    // Lấy danh sách tất cả FlashCard của user
    getAllFlashCards: builder.query<
      GetAllFlashCardsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: `/flashcards/get-all-flashcards?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["FlashCard"],
    }),

    // Tạo FlashCard mới
    createFlashCard: builder.mutation<
      CreateFlashCardResponse,
      CreateFlashCardRequest
    >({
      query: (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("cards", JSON.stringify(data.cards));
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
          url: "/flashcards/create-flashcard",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["FlashCard"],
    }),

    // Tìm kiếm FlashCard
    searchFlashCard: builder.query<
      SearchFlashCardResponse,
      SearchFlashCardParams
    >({
      query: ({ q, level = "all", select = "all", page = 1, limit = 20 }) => {
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
          url: `/flashcards/search-flashcard?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["FlashCard"],
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
  useGetAllFlashCardsQuery,
  useCreateFlashCardMutation,
  useSearchFlashCardQuery,
  useLazySearchFlashCardQuery,
} = flashcardApi;
>>>>>>> origin/main
