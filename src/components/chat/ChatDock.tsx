"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  X,
  MessageCircle,
  Phone,
  Video,
  Send,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatDockProps } from "@/types/chat";
import { ConversationUI, MessageUI } from "@/types/message";
import { useAuth } from "@/hooks/useAuth";
import { useSocketMessages } from "@/hooks/useSocketMessages";
import { useSocketContext } from "@/providers/SocketProvider";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
} from "@/store/services/messageApi";
import { useGetMyFriendsQuery } from "@/store/services/userApi";
import styles from "./ChatDock.module.css";
import { useCall } from "@/hooks/useCall";
import { Users } from "lucide-react";
import { playNotificationSound } from "@/lib/notificationSound";

const transformConversationToUI = (
  conversation: any,
  currentUserId: string
): ConversationUI => {
  const partner = conversation.members.find(
    (member: any) => member._id !== currentUserId
  );

  const lastMessageText = conversation.lastMessage
    ? conversation.lastMessage.senderId === currentUserId
      ? `Bạn: ${conversation.lastMessage.message}`
      : conversation.lastMessage.message
    : "Chưa có tin nhắn";

  return {
    id: conversation._id,
    name: partner?.fullname || partner?.username || "Unknown",
    avatar: partner?.avatar || "/images/placeholders/placeholder.svg",
    lastMessage: lastMessageText,
    timestamp: new Date(conversation.updatedAt).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unread: conversation.unreadCount,
    online: false,
    partnerId: partner?._id || "",
  };
};

const transformMessageToUI = (
  message: any,
  currentUserId: string
): MessageUI => {
  const isMyMessage = message.senderId === currentUserId;
  // Xác định status cho message của mình
  let status: "sending" | "sent" | "delivered" | "read" | "failed" | undefined;
  if (isMyMessage) {
    if (message.isRead) {
      status = "read";
    } else {
      // Mặc định là "sent", sẽ được cập nhật bởi socket events
      status = "sent";
    }
  }

  return {
    id: message._id,
    text: message.message,
    sender: isMyMessage ? "me" : "other",
    timestamp: new Date(message.createdAt).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    read: message.isRead,
    createdAt: new Date(message.createdAt),
    status,
  };
};

const shouldShowTimeSeparator = (
  currentMessage: MessageUI,
  previousMessage: MessageUI | null
): boolean => {
  if (!previousMessage) return false;

  const timeDiff =
    currentMessage.createdAt.getTime() - previousMessage.createdAt.getTime();
  const thirtyMinutes = 30 * 60 * 1000;

  return timeDiff > thirtyMinutes;
};

const formatTimeSeparator = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (messageDate.getTime() === today.getTime()) {
    return `Hôm nay, ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.getTime() === yesterday.getTime()) {
    return `Hôm qua, ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLastActive = (lastActiveAt: string): string => {
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffInMinutes = Math.floor(
    (now.getTime() - lastActive.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes} phút`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} tuần`;
};

interface IndividualChatWindowProps {
  chatId: string;
  conversation: ConversationUI;
  onClose: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

const IndividualChatWindow: React.FC<IndividualChatWindowProps> = ({
  chatId,
  conversation,
  onClose,
  onVoiceCall,
  onVideoCall,
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allMessages, setAllMessages] = useState<MessageUI[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Socket handlers for real-time messaging
  const { sendTypingStart, sendTypingStop, markMessageAsSeen } =
    useSocketMessages({
      onNewMessage: (payload) => {
        // Chỉ xử lý tin nhắn từ conversation hiện tại
        if (payload.senderId === conversation.partnerId) {
          const newMessage: MessageUI = {
            id: payload.messageId,
            text: payload.message,
            sender: "other",
            timestamp: new Date(payload.timestamp).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: false,
            createdAt: new Date(payload.timestamp),
          };

          setAllMessages((prev) => {
            const messageMap = new Map<string, MessageUI>();
            prev.forEach((msg) => messageMap.set(msg.id, msg));
            messageMap.set(newMessage.id, newMessage);

            return Array.from(messageMap.values()).sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          });

          // Scroll to bottom for new message
          setTimeout(() => scrollToBottom(), 50);
        }
      },
      onUserTyping: (payload) => {
        // Chỉ xử lý typing từ partner hiện tại
        if (payload.senderId === conversation.partnerId) {
          setIsPartnerTyping(payload.isTyping);

          if (payload.isTyping) {
            // Auto clear typing after 3 seconds
            if (typingTimeout) clearTimeout(typingTimeout);
            const timeout = setTimeout(() => {
              setIsPartnerTyping(false);
            }, 3000);
            setTypingTimeout(timeout);
          } else {
            if (typingTimeout) {
              clearTimeout(typingTimeout);
              setTypingTimeout(null);
            }
          }
        }
      },
      onMessageDelivered: (payload) => {
        // Cập nhật status của message khi được gửi thành công
        // Chỉ cập nhật message của mình (sender === "me")
        if (payload.messageId) {
          setAllMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.messageId && msg.sender === "me"
                ? { ...msg, status: "delivered" as const }
                : msg
            )
          );
        }
      },
      onMessageSeen: (payload) => {
        // Cập nhật status của message khi được đánh dấu đã đọc
        // Chỉ cập nhật message của mình (sender === "me")
        if (payload.messageId) {
          setAllMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.messageId && msg.sender === "me"
                ? { ...msg, status: "read" as const, read: true }
                : msg
            )
          );
        }
      },
    });

  // Fetch messages for this conversation
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
  } = useGetMessagesQuery({
    partnerId: conversation.partnerId,
    page: 1,
    limit: 30,
  });

  // Send message mutation
  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();

  // Mark messages as read mutation
  const [markAsRead] = useMarkAsReadMutation();

  // Load more messages when scrolling to top
  const loadMoreMessages = async () => {
    if (loadingMore || !hasMoreMessages) return;

    // Store current scroll height BEFORE setting loading state
    const currentScrollHeight = messagesContainerRef.current?.scrollHeight || 0;
    previousScrollHeight.current = currentScrollHeight;

    const nextPage = currentPage + 1;

    try {
      setLoadingMore(true);

      // Manually fetch next page
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
        }/message/${conversation.partnerId}?page=${nextPage}&limit=30`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.items.length > 0) {
          const newMessages = data.data.items
            .map((msg: any) => transformMessageToUI(msg, user?._id || ""))
            .reverse();

          // Update messages and page together to minimize re-renders
          setAllMessages((prev) => {
            // Create a Map to ensure uniqueness by message ID
            const messageMap = new Map<string, MessageUI>();

            // Add existing messages first
            prev.forEach((msg: MessageUI) => messageMap.set(msg.id, msg));

            // Add new messages (will overwrite if same ID exists)
            newMessages.forEach((msg: MessageUI) =>
              messageMap.set(msg.id, msg)
            );

            // Return as array, maintaining chronological order
            return Array.from(messageMap.values()).sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          });
          setCurrentPage(nextPage);

          // Check if there are more messages
          if (data.data.items.length < 30) {
            setHasMoreMessages(false);
          }
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Transform messages - use this for rendering
  const displayMessages = useMemo(() => {
    // If we have allMessages from pagination/optimistic updates, use them
    if (allMessages.length > 0) {
      return allMessages;
    }

    // Otherwise, use initial messages from API
    if (messagesData?.data?.items && user?._id) {
      const initialMessages = messagesData.data.items
        .map((msg) => transformMessageToUI(msg, user._id))
        .reverse();
      return initialMessages;
    }

    return [];
  }, [allMessages, messagesData, user?._id]);

  // Reset messages when conversation changes
  useEffect(() => {
    setAllMessages([]);
    setCurrentPage(1);
    setHasMoreMessages(true);
    setIsInitialLoad(true);
  }, [conversation.partnerId]);

  // Update allMessages when initial data loads
  useEffect(() => {
    if (messagesData?.data?.items && user?._id) {
      const initialMessages = messagesData.data.items
        .map((msg) => transformMessageToUI(msg, user._id))
        .reverse();

      // Use Map to ensure uniqueness
      const messageMap = new Map<string, MessageUI>();
      initialMessages.forEach((msg: MessageUI) => messageMap.set(msg.id, msg));

      setAllMessages(Array.from(messageMap.values()));
      setIsInitialLoad(true);

      // Check if there are more messages available
      if (messagesData.data.items.length < 30) {
        setHasMoreMessages(false);
      }
    }
  }, [messagesData, user?._id, conversation.partnerId]);

  // Auto scroll to bottom when messages load or new message is sent
  useEffect(() => {
    // Only auto-scroll for initial load
    if (displayMessages.length > 0 && isInitialLoad) {
      scrollToBottom();
      setIsInitialLoad(false);
    }
  }, [displayMessages, isInitialLoad]);

  // Auto scroll to bottom when typing indicator appears
  useEffect(() => {
    if (isPartnerTyping && messagesContainerRef.current) {
      // Scroll xuống để hiển thị typing indicator
      const container = messagesContainerRef.current;
      // Sử dụng setTimeout để đảm bảo DOM đã render typing indicator
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }, [isPartnerTyping]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    const messageText = newMessage.trim();

    // Stop typing indicator when sending
    sendTypingStop(conversation.partnerId);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    // Clear input immediately to prevent any residual characters
    setNewMessage("");

    // Optimistic update - add message immediately
    const tempMessage: MessageUI = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: messageText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
      createdAt: new Date(),
      status: "sending", // Trạng thái đang gửi
    };

    setAllMessages((prev) => {
      // Use Map to ensure uniqueness
      const messageMap = new Map<string, MessageUI>();
      prev.forEach((msg: MessageUI) => messageMap.set(msg.id, msg));
      messageMap.set(tempMessage.id, tempMessage);

      return Array.from(messageMap.values()).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    // Scroll to bottom for new message
    setTimeout(() => scrollToBottom(), 50);

    try {
      const response = await sendMessage({
        receiverId: conversation.partnerId,
        message: messageText,
      }).unwrap();

      // Replace temp message with real message from API
      if (response.data?.message) {
        const realMessage = transformMessageToUI(
          response.data.message,
          user?._id || ""
        );
        setAllMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? realMessage : msg))
        );
      } else {
        // Fallback: update status to "sent" if no response data
        setAllMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, status: "sent" as const }
              : msg
          )
        );
      }

      // Focus input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error, {
        messageText,
        partnerId: conversation.partnerId,
        errorDetails: error,
      });

      // Update message status to failed for better UX
      setAllMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? { ...msg, status: "failed" as const }
            : msg
        )
      );

      // Show error notification (you can implement toast here)
      setTimeout(() => {
        // Remove the failed message after showing error
        setAllMessages((prev) =>
          prev.filter((msg) => msg.id !== tempMessage.id)
        );
        // Re-add the text back to input
        setNewMessage(messageText);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
      handleSendMessage();
    }
  };

  // Auto scroll to bottom (instant jump)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Check if user scrolled up more than one screen
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;

    // Check if scrolled to top (with 50px threshold) to load more messages
    if (scrollTop <= 50 && !loadingMore && hasMoreMessages) {
      loadMoreMessages();
    }

    // Check if user scrolled up more than one screen to show scroll button
    const scrolledUp = scrollHeight - scrollTop - clientHeight > clientHeight;
    setShowScrollButton(scrolledUp);
  };

  // Auto scroll to bottom when messages load or new message is sent
  useEffect(() => {
    // Only auto-scroll for initial load
    if (allMessages.length > 0 && isInitialLoad) {
      scrollToBottom();
      setIsInitialLoad(false);
    }
  }, [allMessages, isInitialLoad]);

  // Handle scroll position when loading more messages
  useEffect(() => {
    if (
      currentPage > 1 &&
      messagesContainerRef.current &&
      previousScrollHeight.current
    ) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const scrollDiff = newScrollHeight - previousScrollHeight.current;
          messagesContainerRef.current.scrollTop = scrollDiff;
        }
      });
    }
  }, [currentPage]);

  // Reset pagination state when conversation changes
  useEffect(() => {
    setCurrentPage(1);
    setAllMessages([]);
    setHasMoreMessages(true);
    setLoadingMore(false);
    setIsInitialLoad(true);

    // Auto focus input when conversation opens
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [conversation.partnerId]);

  // Auto focus input after sending message
  useEffect(() => {
    if (!sendingMessage) {
      // Focus input after message is sent
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [sendingMessage]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <div className="relative w-72 sm:w-80 bg-white rounded-t-lg shadow-xl flex flex-col h-96 sm:h-[450px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-2 rounded-t-lg bg-gradient-to-r from-orange-400 to-orange-500 text-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage src={conversation.avatar} />
              <AvatarFallback>{conversation.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            {conversation.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm sm:text-base truncate">
              {conversation.name}
            </h4>
            <p className="text-xs text-orange-100">
              {conversation.online ? "Đang hoạt động" : "Không hoạt động"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full hover:bg-white/20 text-white"
            onClick={onVoiceCall}
          >
            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full hover:bg-white/20 text-white"
            onClick={onVideoCall}
          >
            <Video className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full hover:bg-white/20 text-white"
            onClick={onClose}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-3 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50 to-white relative"
        onScroll={handleScroll}
      >
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          </div>
        ) : messagesError ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-red-500">Lỗi tải tin nhắn</p>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-500">Chưa có tin nhắn</p>
          </div>
        ) : (
          <>
            {/* Loading more messages indicator */}
            {loadingMore && (
              <div className="flex justify-center py-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                  <span className="text-xs text-gray-500">
                    Đang tải tin nhắn cũ...
                  </span>
                </div>
              </div>
            )}

            {displayMessages.map((message, index) => {
              const previousMessage =
                index > 0 ? displayMessages[index - 1] : null;
              const showTimeSeparator = shouldShowTimeSeparator(
                message,
                previousMessage
              );

              // Kiểm tra xem có phải tin nhắn mới nhất của mình không
              const isMyLatestMessage =
                message.sender === "me" &&
                index ===
                  displayMessages.findLastIndex((msg) => msg.sender === "me");

              return (
                <React.Fragment key={`${message.id}-${index}`}>
                  {showTimeSeparator && (
                    <div className="flex justify-center my-3">
                      <div className="bg-white/80 backdrop-blur-sm text-gray-500 text-xs px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                        {formatTimeSeparator(message.createdAt)}
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex group",
                      message.sender === "me" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className="flex flex-col max-w-[85%]">
                      <div
                        className={cn(
                          "px-4 py-2.5 text-sm leading-relaxed rounded-2xl relative shadow-sm",
                          message.sender === "me"
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md ml-8"
                            : "bg-white text-gray-800 rounded-bl-md mr-8 border border-gray-100"
                        )}
                        title={message.timestamp}
                      >
                        <p className="break-words">{message.text}</p>
                      </div>
                      {/* Status indicator chỉ cho tin nhắn mới nhất của mình */}
                      {isMyLatestMessage && message.status && (
                        <div
                          className={cn(
                            "text-xs mt-1.5",
                            message.sender === "me" ? "text-right" : "text-left"
                          )}
                        >
                          {message.status === "sending" && (
                            <span className="flex items-center gap-1.5 text-gray-400">
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              Đang gửi
                            </span>
                          )}
                          {message.status === "sent" && (
                            <span className="text-gray-400">Đã gửi</span>
                          )}
                          {message.status === "delivered" && (
                            <span className="text-gray-400">Đã nhận</span>
                          )}
                          {message.status === "read" && (
                            <span className="text-blue-500">Đã xem</span>
                          )}
                          {message.status === "failed" && (
                            <span className="flex items-center gap-1.5 text-red-500">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Gửi thất bại
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </>
        )}

        <div ref={messagesEndRef} />

        {/* Typing indicator */}
        {isPartnerTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-2xl rounded-bl-md text-xs">
              <div className="flex items-center gap-1">
                <span>Đang nhập</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom button - overlay, fixed above input */}
      {showScrollButton && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 animate-fade-in z-10">
          <Button
            size="icon"
            className="h-9 w-9 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              const value = e.target.value;
              setNewMessage(value);

              // Handle typing indicators
              if (value.trim()) {
                sendTypingStart(conversation.partnerId);

                // Stop typing after 1 second of no input
                if (typingTimeout) clearTimeout(typingTimeout);
                const timeout = setTimeout(() => {
                  sendTypingStop(conversation.partnerId);
                }, 1000);
                setTypingTimeout(timeout);
              } else {
                sendTypingStop(conversation.partnerId);
                if (typingTimeout) {
                  clearTimeout(typingTimeout);
                  setTypingTimeout(null);
                }
              }
            }}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              // Mark all messages as read when user focuses on input
              markAsRead({ partnerId: conversation.partnerId });
            }}
            placeholder="Nhập tin nhắn..."
            disabled={sendingMessage}
            className="flex-1 h-10 text-sm rounded-full border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
            tabIndex={0}
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full hover:bg-orange-100 transition-colors"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
            ) : (
              <Send className="h-4 w-4 text-orange-500" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export function ChatDock({}: ChatDockProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"messages" | "friends">(
    "messages"
  );
  const { socket, connected } = useSocketContext();

  // Detect mobile screen
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch conversations từ API
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useGetConversationsQuery({ page: 1, limit: 10 });

  // Fetch friends từ API với polling để update online status
  const {
    data: friendsData,
    isLoading: friendsLoading,
    error: friendsError,
    refetch: refetchFriends,
  } = useGetMyFriendsQuery(undefined, {
    pollingInterval: 30000, // Poll mỗi 30s để đảm bảo online status luôn đúng
    refetchOnMountOrArgChange: true,
  });

  // Format friends data
  const friends = useMemo(() => {
    if (!friendsData?.data?.friends) return [];
    return friendsData.data.friends;
  }, [friendsData]);

  // Transform conversations data
  const conversations = useMemo(() => {
    if (!conversationsData?.data?.items || !user?._id) return [];

    return conversationsData.data.items.map((conv) => {
      const convUI = transformConversationToUI(conv, user._id);
      // Update online status từ friends list
      const friend = friends.find((f: any) => f._id === convUI.partnerId);
      if (friend) {
        convUI.online = friend.isOnline;
      }
      return convUI;
    });
  }, [conversationsData, user?._id, friends]);

  // Lưu state openChats vào localStorage để giữ trạng thái khi reload
  const [openChats, setOpenChats] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("openChats");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Lưu temp conversations (conversation được tạo từ friends list)
  const [tempConversations, setTempConversations] = useState<
    Map<string, ConversationUI>
  >(new Map());

  const [showChatList, setShowChatList] = useState(false);

  const totalUnreadMessages = conversations.reduce((total, chat) => {
    return total + (chat.unread || 0);
  }, 0);

  const openChat = (chatId: string, tempConv?: ConversationUI) => {
    if (openChats.includes(chatId)) return;

    const newOpenChats = [...openChats, chatId].slice(-3); // Giới hạn tối đa 3 chat
    setOpenChats(newOpenChats);

    // Nếu có temp conversation, lưu vào state
    if (tempConv) {
      setTempConversations((prev) => {
        const newMap = new Map(prev);
        newMap.set(chatId, tempConv);
        return newMap;
      });
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("openChats", JSON.stringify(newOpenChats));
    }
    setShowChatList(false);
  };

  const openFriendChat = (friend: any) => {
    // Tìm existing conversation với friend này
    const existingConv = conversations.find((c) => c.partnerId === friend._id);
    if (existingConv) {
      openChat(existingConv.id);
    } else {
      // Tạo conversation tạm
      const tempConv: ConversationUI = {
        id: `temp-${friend._id}`,
        name: friend.fullname || friend.username,
        avatar: friend.avatar || "/images/placeholders/placeholder.svg",
        lastMessage: "",
        timestamp: "",
        unread: 0,
        online: friend.isOnline,
        partnerId: friend._id,
      };
      openChat(tempConv.id, tempConv);
    }
  };

  const closeChat = (chatId: string) => {
    const newOpenChats = openChats.filter((id) => id !== chatId);
    setOpenChats(newOpenChats);

    if (typeof window !== "undefined") {
      localStorage.setItem("openChats", JSON.stringify(newOpenChats));
    }
  };

  const { initiateCall } = useCall();

  const makeVoiceCall = (chatId: string) => {
    const chat =
      conversations.find((c) => c.id === chatId) ||
      tempConversations.get(chatId);
    const partnerId = chat?.partnerId;
    console.log("[ChatDock] makeVoiceCall:", { chatId, chat, partnerId });
    if (!partnerId) {
      console.error("[ChatDock] No partnerId found for chatId:", chatId);
      return;
    }
    // Use new optimized call flow
    console.log("[ChatDock] Initiating voice call to partnerId:", partnerId);
    initiateCall(partnerId, "audio");
  };

  const makeVideoCall = (chatId: string) => {
    const chat =
      conversations.find((c) => c.id === chatId) ||
      tempConversations.get(chatId);
    const partnerId = chat?.partnerId;
    console.log("[ChatDock] makeVideoCall:", { chatId, chat, partnerId });
    if (!partnerId) {
      console.error("[ChatDock] No partnerId found for chatId:", chatId);
      return;
    }
    // Use new optimized call flow
    console.log("[ChatDock] Initiating video call to partnerId:", partnerId);
    initiateCall(partnerId, "video");
  };

  // Listen to socket events for online status updates and new messages
  useEffect(() => {
    if (!socket || !connected) return;

    // Lắng nghe user status changed
    const handleUserStatusChanged = (data: {
      userId: string;
      status: "online" | "offline";
      lastActiveAt: Date;
    }) => {
      console.log("[ChatDock] userStatusChanged:", data);
      // Refetch friends để cập nhật online status
      refetchFriends();
    };

    // Lắng nghe danh sách user online
    const handleGetOnlineUsers = (onlineUserIds: string[]) => {
      console.log("[ChatDock] getOnlineUsers:", onlineUserIds);
      // Refetch friends để cập nhật online status
      refetchFriends();
    };

    // Lắng nghe tin nhắn mới và phát âm thanh nếu không đang chat với người đó
    const handleNewMessage = (payload: {
      messageId: string;
      senderId: string;
      receiverId: string;
      message: string;
      timestamp: string | Date;
    }) => {
      console.log("[ChatDock] newMessage:", payload);

      // Check xem có đang ở trang messages và đang chat với người này không
      const isOnMessagesPage = pathname === "/messages";
      const activeUserIdFromMessages = isOnMessagesPage
        ? searchParams.get("userId")
        : null;

      // Lấy danh sách partnerId của các chat window đang mở
      const openChatPartnerIds = openChats
        .map((chatId) => {
          const conv =
            conversations.find((c) => c.id === chatId) ||
            tempConversations.get(chatId);
          return conv?.partnerId;
        })
        .filter(Boolean);

      // Nếu đang ở trang messages và đang chat với người này → KHÔNG phát âm thanh
      if (isOnMessagesPage && activeUserIdFromMessages === payload.senderId) {
        // Đang chat với người này trong messages page → không phát âm thanh
        refetchConversations();
        return;
      }

      // Nếu tin nhắn KHÔNG từ người đang chat trong ChatDock → phát âm thanh
      if (!openChatPartnerIds.includes(payload.senderId)) {
        playNotificationSound();
      }

      // Refetch conversations để cập nhật lastMessage
      refetchConversations();
    };

    socket.on("userStatusChanged", handleUserStatusChanged);
    socket.on("getOnlineUsers", handleGetOnlineUsers);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("userStatusChanged", handleUserStatusChanged);
      socket.off("getOnlineUsers", handleGetOnlineUsers);
      socket.off("newMessage", handleNewMessage);
    };
  }, [
    socket,
    connected,
    refetchFriends,
    refetchConversations,
    openChats,
    conversations,
    tempConversations,
    pathname,
    searchParams,
  ]);

  // Hide ChatDock on messages page or mobile
  const shouldHideChatDock = pathname === "/messages" || isMobile;

  if (shouldHideChatDock) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-2 md:right-4 z-50 flex items-end gap-1">
      {/* Individual Chat Windows */}
      {openChats.map((chatId) => {
        const chat =
          conversations.find((c) => c.id === chatId) ||
          tempConversations.get(chatId);
        if (!chat) return null;

        return (
          <IndividualChatWindow
            key={chatId}
            chatId={chatId}
            conversation={chat}
            onClose={() => closeChat(chatId)}
            onVoiceCall={() => makeVoiceCall(chatId)}
            onVideoCall={() => makeVideoCall(chatId)}
          />
        );
      })}

      {/* Chat List Popup */}
      {showChatList && (
        <div
          className="absolute bottom-16 sm:bottom-20 right-0
                      w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl
                      h-[32rem] sm:h-[34rem] flex flex-col"
        >
          {/* Header with Tabs */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => setActiveTab("messages")}
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors",
                  activeTab === "messages"
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Tin nhắn</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("friends")}
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors",
                  activeTab === "friends"
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Bạn bè</span>
                  {friends.filter((f: any) => f.isOnline).length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      {friends.filter((f: any) => f.isOnline).length}
                    </span>
                  )}
                </div>
              </button>
            </div>
            <Input
              placeholder={
                activeTab === "messages" ? "Tìm tin nhắn..." : "Tìm bạn bè..."
              }
              className="h-9 text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === "messages" ? (
              conversationsLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                  <p className="text-sm text-gray-500">Đang tải...</p>
                </div>
              ) : conversationsError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500">Lỗi tải cuộc hội thoại</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    Chưa có cuộc hội thoại
                  </p>
                </div>
              ) : (
                conversations.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    onClick={() => openChat(chat.id)}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.name?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {chat.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {chat.lastMessage || "Không có tin nhắn"}
                      </p>
                    </div>

                    {/* Badge unread */}
                    {chat.unread > 0 && (
                      <div className="bg-orange-500 text-white text-xs rounded-full min-w-[22px] h-5 flex items-center justify-center px-1.5 font-semibold shadow">
                        {chat.unread > 99 ? "99+" : chat.unread}
                      </div>
                    )}
                  </div>
                ))
              )
            ) : friendsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                <p className="text-sm text-gray-500">Đang tải...</p>
              </div>
            ) : friendsError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500">Lỗi tải danh sách bạn bè</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-400">Chưa có bạn bè</p>
                <p className="text-xs text-gray-400 mt-1">
                  Follow lẫn nhau để trở thành bạn bè
                </p>
              </div>
            ) : (
              friends.map((friend: any) => (
                <div
                  key={friend._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                  onClick={() => openFriendChat(friend)}
                >
                  {/* Avatar with online status */}
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>
                        {friend.fullname?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800",
                        friend.isOnline ? "bg-green-500" : "bg-gray-400"
                      )}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {friend.fullname || friend.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {friend.isOnline
                        ? "Đang hoạt động"
                        : friend.lastActiveAt
                        ? `${formatLastActive(friend.lastActiveAt)}`
                        : "Không hoạt động"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Button */}
      <div className="relative">
        <Button
          size="lg"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setShowChatList(!showChatList)}
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </Button>
        {totalUnreadMessages > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 sm:min-w-[24px] sm:h-6 flex items-center justify-center px-1 font-semibold shadow-lg">
            {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
          </div>
        )}
        {totalUnreadMessages === 0 &&
          friends.filter((f: any) => f.isOnline).length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg" />
          )}
      </div>
    </div>
  );
}
