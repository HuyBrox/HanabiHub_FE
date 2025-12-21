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
  credentials: "include", // ─Éß╗â gß╗¡i cookies
  prepareHeaders: (headers) => {
    // Kh├┤ng set Content-Type ß╗ƒ ─æ├óy ─æß╗â browser tß╗▒ ─æß╗Öng set khi c├│ FormData
    return headers;
  },
});

export const flashcardApi = createApi({
  reducerPath: "flashcardApi",
  baseQuery,
  tagTypes: ["FlashList", "FlashCard"],
  endpoints: (builder) => ({
    // Lß║Ñy danh s├ích tß║Ñt cß║ú FlashList (public + cß╗ºa m├¼nh)
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

    // Lß║Ñy chi tiß║┐t FlashList theo ID
    getFlashListById: builder.query<GetFlashListByIdResponse, string>({
      query: (id) => ({
        url: `/flashcards/get-flashlist-detail/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "FlashList", id }],
    }),

    // Tß║ío FlashList mß╗¢i
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

    // Cß║¡p nhß║¡t FlashList
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

    // X├│a FlashList
    deleteFlashList: builder.mutation<DeleteFlashListResponse, string>({
      query: (id) => ({
        url: `/flashcards/delete-flashlist/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FlashList"],
    }),

    // ─É├ính gi├í FlashList
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

    // Lß║Ñy dß╗» liß╗çu hß╗ìc tß║¡p tß╗½ FlashList
    getStudyDataFromList: builder.query<any, string>({
      query: (id) => ({
        url: `/flashcards/study-flashlist/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "FlashList", id }],
    }),

    // T├¼m kiß║┐m FlashList
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

    // Lß║Ñy danh s├ích tß║Ñt cß║ú FlashCard cß╗ºa user
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

    // Tß║ío FlashCard mß╗¢i
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

    // T├¼m kiß║┐m FlashCard
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
