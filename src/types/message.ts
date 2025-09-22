// Types for Message API
export interface MessageUser {
  _id: string;
  fullname: string;
  username: string;
  avatar: string;
}

export interface MessageAPI {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationAPI {
  _id: string;
  members: MessageUser[];
  unreadCount: number;
  lastMessage: {
    _id: string;
    senderId: string;
    message: string;
    createdAt: string;
  } | null;
  updatedAt: string;
  createdAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  message: string;
  data: {
    items: ConversationAPI[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface MessagesResponse {
  success: boolean;
  message: string;
  data: {
    items: MessageAPI[];
    pagination: {
      page: number;
      limit: number;
    };
  };
  timestamp: string;
}

export interface SendMessageRequest {
  receiverId: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: MessageAPI;
    conversationId: string;
  };
  timestamp: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  data: {
    updated: number;
  };
  timestamp: string;
}

// Transformed types for UI
export interface ConversationUI {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  partnerId: string; // ID của người chat cùng (không phải mình)
}

export interface MessageUI {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
  read: boolean;
  createdAt: Date;
  status?: "sending" | "sent" | "delivered" | "read" | "failed"; // Thêm trạng thái failed
}
