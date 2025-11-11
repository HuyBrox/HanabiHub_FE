import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Comment, CreateCommentRequest, UpdateCommentRequest } from "../../types/post";
import { ApiResponse } from "../../types/common";
import { RootState } from "../index";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    return headers;
  },
});

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery,
  tagTypes: ["Comment", "Post"],
  endpoints: (builder) => ({
    getCommentsByPost: builder.query<Comment[], string>({
      query: (postId) => `/comments/post/${postId}`,
      transformResponse: (response: ApiResponse<Comment[]>) => response.data || [],
      providesTags: (result, error, postId) => [
        { type: "Comment", id: `post-${postId}` },
      ],
    }),
    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: (data) => ({
        url: "/comments",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Comment>) => response.data!,
      async onQueryStarted({ targetId, text }, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState;
        const authApiState = (state as any)["authApi"] || {};
        const currentUserQuery = Object.values(authApiState.queries || {}).find(
          (q: any) => q?.endpointName === "getCurrentUser"
        ) as any;
        const currentUser = currentUserQuery?.data?.data || (state as any).auth?.user;

        if (currentUser) {
          const patchResult = dispatch(
            commentApi.util.updateQueryData("getCommentsByPost", targetId, (draft) => {
              const newComment: Comment = {
                _id: `temp-${Date.now()}`,
                text: text,
                author: currentUser,
                likes: [],
                targetModel: "Post",
                targetId,
                createdAt: new Date().toISOString(),
              };
              draft.unshift(newComment as Comment);
            })
          );

          try {
            const result = await queryFulfilled;
            dispatch(
              commentApi.util.updateQueryData("getCommentsByPost", targetId, (draft) => {
                const tempIndex = draft.findIndex((c) => c._id.startsWith("temp-"));
                if (tempIndex !== -1) {
                  draft[tempIndex] = result.data;
                }
              })
            );
          } catch {
            patchResult.undo();
          }
        }
      },
      invalidatesTags: (result, error, { targetId }) => [
        { type: "Comment", id: `post-${targetId}` },
        { type: "Post", id: targetId },
        "Post",
      ],
    }),
    updateComment: builder.mutation<Comment, { id: string; data: UpdateCommentRequest }>({
      query: ({ id, data }) => ({
        url: `/comments/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Comment>) => response.data!,
      invalidatesTags: (result, error, { id }) => [
        { type: "Comment", id },
        "Comment",
        "Post",
      ],
    }),
    deleteComment: builder.mutation<void, { id: string; targetId: string }>({
      query: ({ id }) => ({
        url: `/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { targetId }) => [
        { type: "Comment", id: `post-${targetId}` },
        { type: "Post", id: targetId },
        "Post",
      ],
    }),
    toggleLikeComment: builder.mutation<{ likes: number }, string>({
      query: (id) => ({
        url: `/comments/${id}/like`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ likes: number }>) =>
        response.data!,
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        let patchResults: any[] = [];

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
          const commentApiState = (state as any)[commentApi.reducerPath] || {};
          const allQueries = commentApiState.queries || {};
          
          Object.keys(allQueries).forEach((queryKey) => {
            if (queryKey.startsWith('getCommentsByPost(')) {
              const match = queryKey.match(/getCommentsByPost\("([^"]+)"\)/);
              const postId = match?.[1];
              if (postId) {
                const patchResult = dispatch(
                  commentApi.util.updateQueryData("getCommentsByPost", postId, (draft) => {
                    const updateCommentLikes = (comment: Comment) => {
                      if (comment._id === id) {
                        const isLiked = Array.isArray(comment.likes)
                          ? comment.likes.includes(currentUserId!)
                          : false;
                        
                        if (isLiked) {
                          comment.likes = comment.likes.filter(
                            (likeId: string) => likeId !== currentUserId
                          );
                        } else {
                          comment.likes = [...(Array.isArray(comment.likes) ? comment.likes : []), currentUserId!];
                        }
                      }
                      
                      if (comment.replies) {
                        comment.replies.forEach(updateCommentLikes);
                      }
                    };
                    
                    draft.forEach(updateCommentLikes);
                  })
                );
                patchResults.push(patchResult);
              }
            }
          });
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: "Comment", id },
        "Comment",
      ],
    }),
  }),
});

export const {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useToggleLikeCommentMutation,
} = commentApi;

