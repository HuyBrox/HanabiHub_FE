// RTK Query API cho messages
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ConversationsResponse,
  MessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  MarkAsReadResponse,
} from "../../types/message";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include", // Để gửi cookies
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery,
  tagTypes: ["Conversation", "Message"],
  endpoints: (builder) => ({
    // Lấy danh sách cuộc hội thoại
    getConversations: builder.query<
      ConversationsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/message?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Conversation"],
    }),

    // Lấy tin nhắn trong cuộc hội thoại với một partner
    getMessages: builder.query<
      MessagesResponse,
      { partnerId: string; page?: number; limit?: number }
    >({
      query: ({ partnerId, page = 1, limit = 30 }) => ({
        url: `/message/${partnerId}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: (result, error, { partnerId }) => [
        { type: "Message", id: partnerId },
      ],
    }),

    // Gửi tin nhắn
    sendMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
      query: (messageData) => ({
        url: "/message/send",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: ["Conversation"],
      // Optimistic update cho message
      async onQueryStarted(messageData, { dispatch, queryFulfilled }) {
        // Optimistic update cho conversation list
        const patchResult = dispatch(
          messageApi.util.updateQueryData("getConversations", {}, (draft) => {
            // Tìm conversation với partnerId và cập nhật lastMessage
            const conversation = draft.data.items.find((conv) =>
              conv.members.some(
                (member) => member._id === messageData.receiverId
              )
            );
            if (conversation && conversation.lastMessage) {
              conversation.lastMessage.message = messageData.message;
              conversation.lastMessage.createdAt = new Date().toISOString();
              conversation.updatedAt = new Date().toISOString();
            }
          })
        );

        // Optimistic update cho messages
        const messagePatchResult = dispatch(
          messageApi.util.updateQueryData(
            "getMessages",
            { partnerId: messageData.receiverId },
            (draft) => {
              // Thêm tin nhắn mới vào đầu list (vì sort desc)
              const newMessage = {
                _id: `temp-${Date.now()}`,
                senderId: "me", // Sẽ được replace bằng real userId
                receiverId: messageData.receiverId,
                message: messageData.message,
                isRead: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              draft.data.items.unshift(newMessage);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic updates on error
          patchResult.undo();
          messagePatchResult.undo();
        }
      },
    }),

    // Đánh dấu tin nhắn đã đọc
    markAsRead: builder.mutation<MarkAsReadResponse, { partnerId: string }>({
      query: ({ partnerId }) => ({
        url: `/message/${partnerId}/read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { partnerId }) => [
        "Conversation",
        { type: "Message", id: partnerId },
      ],
    }),
  }),
});

// Export hooks để sử dụng trong components
export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
} = messageApi;
