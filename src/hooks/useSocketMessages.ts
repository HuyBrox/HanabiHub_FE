import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSocketContext } from "@/providers/SocketProvider";
import { messageApi } from "@/store/services/messageApi";

interface NewMessagePayload {
  messageId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string | Date;
}

interface MessageSeenPayload {
  messageId: string;
  userId: string;
  seenAt: string | Date;
}

interface MessageDeliveredPayload {
  messageId: string;
  deliveredAt: string | Date;
}

interface UserTypingPayload {
  senderId: string;
  isTyping: boolean;
  timestamp: string | Date;
}

interface UseSocketMessagesProps {
  onNewMessage?: (payload: NewMessagePayload) => void;
  onMessageSeen?: (payload: MessageSeenPayload) => void;
  onMessageDelivered?: (payload: MessageDeliveredPayload) => void;
  onUserTyping?: (payload: UserTypingPayload) => void;
}

export const useSocketMessages = (props: UseSocketMessagesProps = {}) => {
  const { socket, connected } = useSocketContext();
  const dispatch = useDispatch();

  // Làm mới danh sách cuộc trò chuyện
  const invalidateConversations = useCallback(() => {
    dispatch(messageApi.util.invalidateTags(["Conversation"]));
  }, [dispatch]);

  // Làm mới tin nhắn của một đối tượng chat
  const invalidateMessages = useCallback(
    (partnerId: string) => {
      dispatch(
        messageApi.util.invalidateTags([{ type: "Message", id: partnerId }])
      );
    },
    [dispatch]
  );

  // Xử lý khi nhận tin nhắn mới
  const handleNewMessage = useCallback(
    (payload: NewMessagePayload) => {

      try {
        props.onNewMessage?.(payload);
        invalidateConversations();
        invalidateMessages(payload.senderId);
      } catch (error) {
        console.error("Lỗi xử lý tin nhắn mới:", error);
      }
    },
    [invalidateConversations, invalidateMessages, props]
  );

  // Xử lý khi tin nhắn được đánh dấu đã đọc
  const handleMessageSeen = useCallback(
    (payload: MessageSeenPayload) => {

      try {
        props.onMessageSeen?.(payload);
      } catch (error) {
        console.error("Lỗi xử lý tin nhắn đã đọc:", error);
      }
    },
    [props]
  );

  // Xử lý khi tin nhắn được gửi thành công
  const handleMessageDelivered = useCallback(
    (payload: MessageDeliveredPayload) => {

      try {
        props.onMessageDelivered?.(payload);
      } catch (error) {
        console.error("Lỗi xử lý tin nhắn đã gửi:", error);
      }
    },
    [props]
  );

  // Xử lý typing indicator
  const handleUserTyping = useCallback(
    (payload: UserTypingPayload) => {

      try {
        props.onUserTyping?.(payload);
      } catch (error) {
        console.error("Lỗi xử lý trạng thái gõ phím:", error);
      }
    },
    [props]
  );

  useEffect(() => {
    if (!socket || !connected) return;

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSeen", handleMessageSeen);
    socket.on("messageDelivered", handleMessageDelivered);
    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("messageDelivered", handleMessageDelivered);
      socket.off("userTyping", handleUserTyping);
    };
  }, [
    socket,
    connected,
    handleNewMessage,
    handleMessageSeen,
    handleMessageDelivered,
    handleUserTyping,
  ]);

  const sendTypingStart = useCallback(
    (receiverId: string) => {
      if (socket && connected) {
        socket.emit("startTyping", { receiverId });
      }
    },
    [socket, connected]
  );

  const sendTypingStop = useCallback(
    (receiverId: string) => {
      if (socket && connected) {
        socket.emit("stopTyping", { receiverId });
      }
    },
    [socket, connected]
  );

  const markMessageAsSeen = useCallback(
    (messageId: string, senderId: string) => {
      if (socket && connected) {
        socket.emit("markMessageSeen", { messageId, senderId });
      }
    },
    [socket, connected]
  );

  return {
    connected,
    sendTypingStart,
    sendTypingStop,
    markMessageAsSeen,
  };
};
