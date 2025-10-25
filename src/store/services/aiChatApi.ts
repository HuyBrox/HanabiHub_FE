import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * 🤖 AI Chat API - Tương tác với chatbot AI (Qwen/RAG/Translator)
 * Endpoint: /api/chat (từ AI_Hanabi FastAPI)
 */

// ============ TYPES ============

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  user_id: string;
  message: string;
}

export interface ChatResponse {
  status: string;
  user_id: string;
  message: string;
  reply: string;
  source: "Qwen" | "RAG" | "Translator";
  timestamp: string;
}

// ============ API ============

export const aiChatApi = createApi({
  reducerPath: "aiChatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000",
    prepareHeaders: (headers, { getState }) => {
      // Lấy token từ state nếu cần (hiện tại AI API chưa cần auth)
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ChatHistory"],
  endpoints: (builder) => ({
    /**
     * 💬 Send chat message
     * POST /api/chat
     */
    sendChatMessage: builder.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({
        url: "/chat",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChatHistory"],
    }),

    /**
     * 🗑️ Clear chat history
     * DELETE /api/chat/history/{user_id}
     */
    clearChatHistory: builder.mutation<{ status: string }, string>({
      query: (userId) => ({
        url: `/chat/history/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatHistory"],
    }),
  }),
});

export const { useSendChatMessageMutation, useClearChatHistoryMutation } =
  aiChatApi;
