//đây là dùng createApi của redux toolkit query để tạo các endpoint gọi API liên quan đến user (endpint là getUsers, getUserById, updateUser)
//fetchBaseQuery để thiết lập base URL cho các request
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

//hàm này tạo ra một API slice tên là userApi với các endpoint để lấy danh sách người dùng, lấy thông tin người dùng theo ID và cập nhật thông tin người dùng
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<any[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
    getUserById: builder.query<any, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    updateUser: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} = userApi;
