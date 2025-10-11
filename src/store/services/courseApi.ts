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
  lessons: Lesson[];
  level: string;
  instructor: Instructor;
  students: string[];
  studentCount: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  type: "video" | "task";
  content: string;
  videoUrl: string;
  videoType?: "youtube" | "upload";
  duration: number;
  jsonTask?: any;
  taskType?: string;
  order: number;
  userCompleted: any[];
  Comments: any[];
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
  timestamp: string;
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

    // Lấy tất cả courses
    getAllCourses: builder.query<ApiResponse<Course[]>, void>({
      query: () => ({
        url: "/courses/get-all",
        method: "GET",
      }),
      providesTags: ["Course"],
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
    deleteLesson: builder.mutation<ApiResponse<null>, { lessonId: string; courseId: string }>({
      query: ({ lessonId, courseId }) => ({
        url: `/courses/lesson/${lessonId}`,
        method: "DELETE",
        body: { courseId },
      }),
      invalidatesTags: ["Lesson", "Course"],
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
} = courseApi;

