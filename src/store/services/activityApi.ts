import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * 🎯 Activity Tracking API - Ghi lại các hoạt động học tập của user
 * Sẽ được gọi âm thầm khi user học bài, không block UI
 */

// ============ TYPES ============

export interface TrackVideoRequest {
  courseId?: string;
  lessonId: string;
  lessonTitle?: string;
  totalDuration: number; // seconds
  watchedDuration: number; // seconds
  isWatchedCompletely?: boolean;
  watchCount?: number;
  completedAt?: string; // ISO date
}

export interface TrackTaskRequest {
  courseId?: string;
  lessonId: string;
  lessonTitle?: string;
  taskType: "multiple_choice" | "fill_blank" | "listening" | "matching" | "speaking" | "reading";
  score: number;
  maxScore?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  timeSpent?: number; // seconds
  completedAt?: string; // ISO date
}

export interface TrackCourseAccessRequest {
  courseId: string;
  action?: "enroll" | "continue" | "complete";
  isCompleted?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include",
  prepareHeaders: (headers) => {
    return headers;
  },
});

export const activityApi = createApi({
  reducerPath: "activityApi",
  baseQuery,
  tagTypes: ["Activity"],
  endpoints: (builder) => ({
    // ============ TRACKING ENDPOINTS (âm thầm không block UI) ============

    // 📹 Track video lesson activity
    trackVideoActivity: builder.mutation<ApiResponse<null>, TrackVideoRequest>({
      query: (data) => ({
        url: "/activity/track-video",
        method: "POST",
        body: data,
      }),
      // Không invalidate tags vì không cần refetch data
      // Chỉ log error nếu fail, không throw
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.warn("Failed to track video activity (non-blocking):", error);
        }
      },
    }),

    // 📝 Track task lesson activity
    trackTaskActivity: builder.mutation<ApiResponse<{ passed: boolean }>, TrackTaskRequest>({
      query: (data) => ({
        url: "/activity/track-task",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.warn("Failed to track task activity (non-blocking):", error);
        }
      },
    }),

    // 📚 Track course access
    trackCourseAccess: builder.mutation<ApiResponse<null>, TrackCourseAccessRequest>({
      query: (data) => ({
        url: "/activity/track-course-access",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.warn("Failed to track course access (non-blocking):", error);
        }
      },
    }),

    // 📊 Get activity summary (optional, for debugging)
    getActivitySummary: builder.query<
      ApiResponse<{
        totalLessons: number;
        totalFlashcardSessions: number;
        totalCardsLearned: number;
        totalDays: number;
        totalTimeSpent: number;
        coursesCount: number;
      }>,
      void
    >({
      query: () => ({
        url: "/activity/summary",
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
  }),
});

// Export hooks
export const {
  useTrackVideoActivityMutation,
  useTrackTaskActivityMutation,
  useTrackCourseAccessMutation,
  useGetActivitySummaryQuery,
} = activityApi;

