"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
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
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from "@/store/services/messageApi";
import styles from "./ChatDock.module.css";
import { useCall } from "@/hooks/useCall";

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
  return {
    id: message._id,
    text: message.message,
    sender: message.senderId === currentUserId ? "me" : "other",
    timestamp: new Date(message.createdAt).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    read: message.isRead,
    createdAt: new Date(message.createdAt),
    status: message.senderId === currentUserId ? ("sent" as const) : undefined,
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

          // Auto mark as read if conversation is open
          setTimeout(() => {
            markMessageAsSeen(payload.messageId, payload.senderId);
          }, 1000);
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

  // Update allMessages when initial data loads
  useEffect(() => {
    if (messagesData?.data?.items && user?._id && allMessages.length === 0) {
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
  }, [messagesData, user?._id, allMessages.length]);

  // Auto scroll to bottom when messages load or new message is sent
  useEffect(() => {
    // Only auto-scroll for initial load
    if (displayMessages.length > 0 && isInitialLoad) {
      scrollToBottom();
      setIsInitialLoad(false);
    }
  }, [displayMessages, isInitialLoad]);

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
      await sendMessage({
        receiverId: conversation.partnerId,
        message: messageText,
      }).unwrap();

      // Message sent successfully - update status to "sent"
      setAllMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "sent" as const } : msg
        )
      );

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
        className="flex-1 p-2 sm:p-3 overflow-y-auto space-y-2 bg-gray-50 relative"
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
                    <div className="flex justify-center my-2">
                      <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
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
                    <div className="flex flex-col">
                      <div
                        className={cn(
                          "max-w-[80%] sm:max-w-[75%] px-3 sm:px-4 py-2 text-xs sm:text-sm leading-relaxed rounded-2xl relative",
                          message.sender === "me"
                            ? "bg-orange-500 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                        )}
                        title={message.timestamp}
                      >
                        <p>{message.text}</p>
                      </div>
                      {/* Status indicator chỉ cho tin nhắn mới nhất của mình */}
                      {isMyLatestMessage && message.status && (
                        <div className="text-xs text-gray-400 mt-1 text-right">
                          {message.status === "sending" && (
                            <span className="flex items-center gap-1 justify-end">
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              Đang gửi
                            </span>
                          )}
                          {message.status === "sent" && <span>Đã gửi</span>}
                          {message.status === "delivered" && (
                            <span>Đã nhận</span>
                          )}
                          {message.status === "read" && <span>Đã xem</span>}
                          {message.status === "failed" && (
                            <span className="flex items-center gap-1 justify-end text-red-500">
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
                <span>Đang soạn tin nhắn</span>
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
      <div className="p-2 sm:p-3 bg-white">
        <div className="flex items-center gap-1 sm:gap-2">
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
            placeholder="Nhập tin nhắn..."
            disabled={sendingMessage}
            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
            tabIndex={0}
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-orange-100"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500"></div>
            ) : (
              <Send className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
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
  } = useGetConversationsQuery({ page: 1, limit: 10 });

  // Transform conversations data
  const conversations = useMemo(() => {
    if (!conversationsData?.data?.items || !user?._id) return [];

    return conversationsData.data.items.map((conv) =>
      transformConversationToUI(conv, user._id)
    );
  }, [conversationsData, user?._id]);

  // Lưu state openChats vào localStorage để giữ trạng thái khi reload
  const [openChats, setOpenChats] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("openChats");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [showChatList, setShowChatList] = useState(false);

  const totalUnreadMessages = conversations.reduce((total, chat) => {
    return total + (chat.unread || 0);
  }, 0);

  const openChat = (chatId: string) => {
    if (openChats.includes(chatId)) return;

    const newOpenChats = [...openChats, chatId].slice(-3); // Giới hạn tối đa 3 chat
    setOpenChats(newOpenChats);

    if (typeof window !== "undefined") {
      localStorage.setItem("openChats", JSON.stringify(newOpenChats));
    }
    setShowChatList(false);
  };

  const closeChat = (chatId: string) => {
    const newOpenChats = openChats.filter((id) => id !== chatId);
    setOpenChats(newOpenChats);

    if (typeof window !== "undefined") {
      localStorage.setItem("openChats", JSON.stringify(newOpenChats));
    }
  };

  const { initiateCall, testSocketConnection } = useCall();

  const makeVoiceCall = (chatId: string) => {
    const chat = conversations.find((c) => c.id === chatId);
    const partnerId = chat?.partnerId;
    console.log("[ChatDock] makeVoiceCall:", { chatId, chat, partnerId });
    if (!partnerId) {
      console.error("[ChatDock] No partnerId found for chatId:", chatId);
      return;
    }
    // Use new optimized call flow
    console.log("[ChatDock] Initiating voice call to partnerId:", partnerId);
    initiateCall(partnerId, 'audio');
  };

  const makeVideoCall = (chatId: string) => {
    const chat = conversations.find((c) => c.id === chatId);
    const partnerId = chat?.partnerId;
    console.log("[ChatDock] makeVideoCall:", { chatId, chat, partnerId });
    if (!partnerId) {
      console.error("[ChatDock] No partnerId found for chatId:", chatId);
      return;
    }
    // Use new optimized call flow
    console.log("[ChatDock] Initiating video call to partnerId:", partnerId);
    initiateCall(partnerId, 'video');
  };

  // Hide ChatDock on messages page or mobile
  const shouldHideChatDock = pathname === "/messages" || isMobile;

  if (shouldHideChatDock) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-2 md:right-4 z-50 flex items-end gap-1">
      {/* Individual Chat Windows */}
      {openChats.map((chatId) => {
        const chat = conversations.find((c) => c.id === chatId);
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
                      w-72 sm:w-80 bg-white rounded-xl shadow-2xl
                      h-[27rem] sm:h-[27rem] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-xl shadow-sm flex items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-white whitespace-nowrap">
              Tin nhắn
            </h3>
            <Input
              placeholder="Tìm kiếm..."
              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm bg-white/90 focus:bg-white border-none shadow-sm placeholder-gray-400"
              onFocus={() => setShowChatList(true)}
            />
          </div>

          {/* Body */}
          <div className="p-1 sm:p-2">
            {conversationsLoading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-orange-500 mb-2"></div>
                <p className="text-xs text-gray-500">Đang tải...</p>
              </div>
            ) : conversationsError ? (
              <div className="text-center py-6">
                <p className="text-xs text-red-500">Lỗi tải cuộc hội thoại</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400">Chưa có cuộc hội thoại</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-orange-50 rounded-lg cursor-pointer transition"
                  onClick={() => openChat(chat.id)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-orange-100">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>{chat.name?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                      {chat.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage || "Không có tin nhắn"}
                    </p>
                  </div>

                  {/* Badge unread */}
                  {chat.unread > 0 && (
                    <div className="bg-orange-500 text-white text-[11px] sm:text-xs rounded-full min-w-[20px] h-5 sm:h-6 flex items-center justify-center px-1 font-medium shadow">
                      {chat.unread > 99 ? "99+" : chat.unread}
                    </div>
                  )}
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
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 sm:min-w-[24px] sm:h-6 flex items-center justify-center px-1 font-medium shadow-lg">
            {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
          </div>
        )}
      </div>
    </div>
  );
}
