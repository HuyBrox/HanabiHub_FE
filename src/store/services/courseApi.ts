import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types
export interface Instructor {
  _id: string;
  fullname: string;
  username: string;
  avatar?: string;
  email: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  lessons?: Lesson[];
  level?: string;
  instructor?: Instructor;
  students?: string[];
  studentCount?: number;
  price: number;
  ratings?: Array<{ user: string; rating: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  type: "video" | "task";
  content: string;
  videoUrl?: string;
  videoType?: "youtube" | "upload";
  duration?: number;
  jsonTask?: any;
  taskType?: string;
  order: number;
  userCompleted?: any[];
  Comments?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnail?: File;
  level: string;
  price: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  thumbnail?: File;
  level?: string;
  price?: number;
}

export interface CreateLessonRequest {
  courseId: string;
  title: string;
  type: "video" | "task";
  content: string;
  videoUrl?: string;
  videoType?: "youtube" | "upload";
  video?: File;
  jsonTask?: any;
}

export interface UpdateLessonRequest {
  title?: string;
  type?: "video" | "task";
  content?: string;
  videoUrl?: string;
  videoType?: "youtube" | "upload";
  video?: File;
  jsonTask?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface UserCourseProgress {
  _id: string;
  userId: string;
  courseId: string;
  currentLessonId?: string;
  currentLessonProgress: {
    videoTimestamp?: number;
    taskAnswers?: any;
    lastAccessedAt: string;
  };
  completedLessons: Array<{
    lessonId: string;
    completedAt: string;
    score?: number;
    maxScore?: number;
    attempts: number;
  }>;
  status: "not_started" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  totalTimeSpent: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include", // ✅ quan trọng để gửi cookie
  prepareHeaders: (headers) => headers,
});

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery,
  tagTypes: ["Course", "Lesson"],
  endpoints: (builder) => ({
    // ============ COURSE ENDPOINTS ============

    getAllCourses: builder.query<
      ApiResponse<Course[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: "/courses",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Course"],
      transformResponse: (response: any) => {
        if (response.data && Array.isArray(response.data.courses)) {
          return { ...response, data: response.data.courses };
        }
        return response;
      },
    }),

    getCourseById: builder.query<ApiResponse<Course>, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Course", id }],
    }),

    createCourse: builder.mutation<ApiResponse<Course>, FormData>({
      query: (formData) => ({
        url: "/courses/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Course"],
    }),

    updateCourse: builder.mutation<
      ApiResponse<Course>,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Course", id },
        "Course",
      ],
    }),

    deleteCourse: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    // ============ LESSON ENDPOINTS ============

    getLessonById: builder.query<ApiResponse<Lesson>, string>({
      query: (id) => ({
        url: `/courses/lesson/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Lesson", id }],
    }),

    createLesson: builder.mutation<ApiResponse<Lesson>, FormData>({
      query: (formData) => ({
        url: "/courses/lesson",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Lesson", "Course"],
    }),

    updateLesson: builder.mutation<
      ApiResponse<Lesson>,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/courses/lesson/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Lesson", id },
        "Lesson",
        "Course",
      ],
    }),

    deleteLesson: builder.mutation<
      ApiResponse<null>,
      { lessonId: string; courseId: string }
    >({
      query: ({ lessonId, courseId }) => ({
        url: `/courses/lesson/${lessonId}`,
        method: "DELETE",
        body: { courseId },
      }),
      invalidatesTags: ["Lesson", "Course"],
    }),

    uploadAudio: builder.mutation<ApiResponse<string>, FormData>({
      query: (formData) => ({
        url: "/courses/lesson/upload-audio",
        method: "POST",
        body: formData,
      }),
    }),

    // ============ USER COURSE PROGRESS ENDPOINTS ============

    getUserCourseProgress: builder.query<
      ApiResponse<UserCourseProgress>,
      string
    >({
      query: (courseId) => ({
        url: `/courses/progress/${courseId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, courseId) => [
        { type: "Course", id: courseId },
      ],
    }),

    getAllUserProgress: builder.query<ApiResponse<UserCourseProgress[]>, void>({
      query: () => ({
        url: "/courses/my-progress",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    updateCurrentLesson: builder.mutation<
      ApiResponse<UserCourseProgress>,
      {
        courseId: string;
        lessonId: string;
        videoTimestamp?: number;
        taskAnswers?: any;
      }
    >({
      query: ({ courseId, ...body }) => ({
        url: `/courses/progress/${courseId}/update-lesson`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    markLessonComplete: builder.mutation<
      ApiResponse<UserCourseProgress>,
      { courseId: string; lessonId: string; score?: number; maxScore?: number }
    >({
      query: ({ courseId, ...body }) => ({
        url: `/courses/progress/${courseId}/complete-lesson`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Course", id: courseId },
        "Course",
      ],
    }),

    resetCourseProgress: builder.mutation<ApiResponse<null>, string>({
      query: (courseId) => ({
        url: `/courses/progress/${courseId}/reset`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, courseId) => [
        { type: "Course", id: courseId },
        "Course",
      ],
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetLessonByIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useUploadAudioMutation,
  useGetUserCourseProgressQuery,
  useGetAllUserProgressQuery,
  useUpdateCurrentLessonMutation,
  useMarkLessonCompleteMutation,
  useResetCourseProgressMutation,
  useRateCourseMutation,
} = courseApi;
