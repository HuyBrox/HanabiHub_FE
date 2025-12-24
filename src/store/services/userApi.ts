// RTK Query API cho quản lý user
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include", // Để gửi cookies
  prepareHeaders: (headers, { endpoint }) => {
    // RTK Query tự động không set Content-Type cho FormData
    // Chỉ set Content-Type cho các request JSON thông thường
    // updateProfile dùng FormData nên không set Content-Type
    if (endpoint !== "updateProfile") {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery,
  tagTypes: ["User", "Profile"],
  endpoints: (builder) => ({
    // Lấy danh sách tất cả user
    getUsers: builder.query<any[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
    // Lấy thông tin user theo ID
    getUserById: builder.query<any, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    // Cập nhật thông tin user
    updateUser: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    // Profile stats endpoints
    getUserStats: builder.query<any, void>({
      query: () => "/user/profile/stats",
      providesTags: ["Profile"],
    }),
    getUserCourses: builder.query<any[], void>({
      query: () => "/user/profile/courses",
      providesTags: ["Profile"],
    }),
    getWeeklyProgress: builder.query<any[], void>({
      query: () => "/user/profile/weekly-progress",
      providesTags: ["Profile"],
    }),
    getUserAchievements: builder.query<any[], void>({
      query: () => "/user/profile/achievements",
      providesTags: ["Profile"],
    }),
    getUserInsights: builder.query<any, void>({
      query: () => "/user/profile/insights",
      providesTags: ["Profile"],
    }),
    // Update profile
    updateProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/user/change-profile",
        method: "PATCH",
        body: formData,
        // Không set Content-Type, để browser tự set với boundary cho FormData
      }),
      invalidatesTags: ["Profile", "User"],
    }),
    // Search users
    searchUsers: builder.query<any, { q: string }>({
      query: ({ q }) => ({
        url: "/user/search",
        params: { q },
      }),
      providesTags: ["User"],
    }),
    // Get user profile by ID (for viewing other users' profiles)
    getUserProfileById: builder.query<any, string>({
      query: (id) => `/user/profile/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    // Follow user
    followUser: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({
        url: `/user/${userId}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        "User",
      ],
    }),
    // Unfollow user
    unfollowUser: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({
        url: `/user/${userId}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        "User",
      ],
    }),
    // Get friends list
    getFriends: builder.query<any, string>({
      query: (userId) => `/user/friends/${userId}`,
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    // Get my friends list (for ChatDock)
    getMyFriends: builder.query<any, void>({
      query: () => "/user/friends/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useGetUserStatsQuery,
  useGetUserCoursesQuery,
  useGetWeeklyProgressQuery,
  useGetUserAchievementsQuery,
  useGetUserInsightsQuery,
  useUpdateProfileMutation,
  useSearchUsersQuery,
  useGetUserProfileByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFriendsQuery,
  useGetMyFriendsQuery,
} = userApi;
