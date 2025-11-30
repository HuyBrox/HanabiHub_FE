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
  level: string;
  instructor?: Instructor;
  students?: string[];
  studentCount?: number;
  price: number;
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
  credentials: "include",
  prepareHeaders: (headers) => {
    return headers;
  },
});

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery,
  tagTypes: ["Course", "Lesson"],
  endpoints: (builder) => ({
    // ============ COURSE ENDPOINTS ============

    // Lấy tất cả courses (dùng chung cho cả admin và user)
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
        // Nếu response có cấu trúc { courses: [], pagination: {} }, lấy courses
        if (response.data && Array.isArray(response.data.courses)) {
          return {
            ...response,
            data: response.data.courses,
          };
        }
        // Nếu response.data là array trực tiếp
        return response;
      },
    }),

    // Lấy chi tiết course theo ID
    getCourseById: builder.query<ApiResponse<Course>, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Course", id }],
    }),

    // Tạo course mới (Admin)
    createCourse: builder.mutation<ApiResponse<Course>, FormData>({
      query: (formData) => ({
        url: "/courses/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Course"],
    }),

    // Cập nhật course (Admin)
    updateCourse: builder.mutation<
      ApiResponse<Course>,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/courses/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Course", id },
        "Course",
      ],
    }),

    // Xóa course (Admin)
    deleteCourse: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/courses/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    // ============ LESSON ENDPOINTS ============

    // Lấy chi tiết lesson theo ID
    getLessonById: builder.query<ApiResponse<Lesson>, string>({
      query: (id) => ({
        url: `/courses/lesson/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Lesson", id }],
    }),

    // Tạo lesson mới (Admin)
    createLesson: builder.mutation<ApiResponse<Lesson>, FormData>({
      query: (formData) => ({
        url: "/courses/lesson",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Lesson", "Course"],
    }),

    // Cập nhật lesson (Admin)
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

    // Xóa lesson (Admin)
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

    // Upload audio cho task (Admin)
    uploadAudio: builder.mutation<ApiResponse<string>, FormData>({
      query: (formData) => ({
        url: "/courses/lesson/upload-audio",
        method: "POST",
        body: formData,
        headers: {
          // Không set Content-Type, để browser tự set với boundary
        },
      }),
    }),

    // ============ USER COURSE PROGRESS ENDPOINTS ============

    // Lấy tiến độ của user trong 1 khóa học
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

    // Lấy tất cả tiến độ của user
    getAllUserProgress: builder.query<
      ApiResponse<UserCourseProgress[]>,
      void
    >({
      query: () => ({
        url: "/courses/my-progress",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    // Cập nhật bài học hiện tại (checkpoint)
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

    // Đánh dấu bài học đã hoàn thành
    markLessonComplete: builder.mutation<
      ApiResponse<UserCourseProgress>,
      {
        courseId: string;
        lessonId: string;
        score?: number;
        maxScore?: number;
      }
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

    // Reset tiến độ khóa học
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

// Export hooks
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
} = courseApi;
