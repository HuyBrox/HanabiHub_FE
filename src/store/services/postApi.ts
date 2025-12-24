import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Post, CreatePostRequest, UpdatePostRequest } from "../../types/post";
import { ApiResponse } from "../../types/common";
import { RootState } from "../index";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    return headers;
  },
});

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery,
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getAllPosts: builder.query<Post[], void>({
      query: () => "/posts",
      transformResponse: (response: ApiResponse<Post[]>) => response.data || [],
      providesTags: ["Post"],
    }),
    getPostById: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      transformResponse: (response: ApiResponse<Post>) => response.data!,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),
    createPost: builder.mutation<Post, CreatePostRequest>({
      query: (data) => {
        const formData = new FormData();
        if (data.caption) formData.append("caption", data.caption);
        if (data.desc) formData.append("desc", data.desc);
        if (data.images && data.images.length > 0) {
          data.images.forEach((file) => {
            formData.append("images", file);
          });
        }
        return {
          url: "/posts",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<Post>) => response.data!,
      invalidatesTags: ["Post"],
    }),
    updatePost: builder.mutation<Post, { id: string; data: UpdatePostRequest }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        if (data.caption !== undefined) formData.append("caption", data.caption);
        if (data.desc !== undefined) formData.append("desc", data.desc);
        if (data.images) {
          if (Array.isArray(data.images) && data.images.length > 0) {
            if (typeof data.images[0] === "string") {
              formData.append("images", JSON.stringify(data.images));
            } else {
              data.images.forEach((file) => {
                formData.append("images", file as File);
              });
            }
          }
        }
        return {
          url: `/posts/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<Post>) => response.data!,
      invalidatesTags: (result, error, { id }) => [
        { type: "Post", id },
        "Post",
      ],
    }),
    deletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
    toggleLikePost: builder.mutation<{ likes: number }, string>({
      query: (id) => ({
        url: `/posts/${id}/like`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ likes: number }>) =>
        response.data!,
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        let patchResult: any;
        let patchResultDetail: any;

        const state = getState() as RootState;
        let currentUserId: string | undefined;
        
        try {
          const authApiState = (state as any)["authApi"];
          if (authApiState?.queries) {
            const queryEntries = Object.entries(authApiState.queries);
            for (const [, queryData] of queryEntries) {
              const q = queryData as any;
              if (q?.endpointName === "getCurrentUser" && q?.data?.data?._id) {
                currentUserId = q.data.data._id;
                break;
              }
            }
          }
          
          if (!currentUserId && (state as any).auth?.user?._id) {
            currentUserId = (state as any).auth.user._id;
          }
        } catch (e) {
          console.warn("Could not get currentUserId for optimistic update", e);
        }

        if (currentUserId) {
          patchResult = dispatch(
            postApi.util.updateQueryData("getAllPosts", undefined, (draft) => {
              const post = draft.find((p) => p._id === id);
              if (post) {
                const isLiked = Array.isArray(post.likes)
                  ? post.likes.includes(currentUserId)
                  : false;
                
                if (isLiked) {
                  post.likes = post.likes.filter(
                    (likeId: string) => likeId !== currentUserId
                  );
                } else {
                  post.likes = [...(Array.isArray(post.likes) ? post.likes : []), currentUserId];
                }
              }
            })
          );

          patchResultDetail = dispatch(
            postApi.util.updateQueryData("getPostById", id, (draft) => {
              const isLiked = Array.isArray(draft.likes)
                ? draft.likes.includes(currentUserId)
                : false;
              
              if (isLiked) {
                draft.likes = draft.likes.filter(
                  (likeId: string) => likeId !== currentUserId
                );
              } else {
                draft.likes = [...(Array.isArray(draft.likes) ? draft.likes : []), currentUserId];
              }
            })
          );
        }

        try {
          await queryFulfilled;
        } catch {
          if (patchResult) patchResult.undo();
          if (patchResultDetail) patchResultDetail.undo();
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: "Post", id },
        "Post",
      ],
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikePostMutation,
} = postApi;

