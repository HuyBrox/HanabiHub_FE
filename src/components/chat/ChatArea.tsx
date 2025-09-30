"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Phone, Video, Info, Send, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationUI, MessageUI } from "@/types/message";
import { useAuth } from "@/hooks/useAuth";
import { useSocketMessages } from "@/hooks/useSocketMessages";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
} from "@/store/services/messageApi";
import { useCall } from "@/hooks/useCall";

interface ChatAreaProps {
  conversation: ConversationUI;
  onClose?: () => void;
}

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

export default function ChatArea({ conversation, onClose }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const { initiateCall } = useCall();

  // Call functions
  const makeVoiceCall = () => {
    const partnerId = conversation.partnerId;
    console.log("[ChatArea] makeVoiceCall:", { partnerId });
    if (!partnerId) {
      console.error("[ChatArea] No partnerId found");
      return;
    }
    console.log("[ChatArea] Initiating voice call to partnerId:", partnerId);
    initiateCall(partnerId, "audio");
  };

  const makeVideoCall = () => {
    const partnerId = conversation.partnerId;
    console.log("[ChatArea] makeVideoCall:", { partnerId });
    if (!partnerId) {
      console.error("[ChatArea] No partnerId found");
      return;
    }
    console.log("[ChatArea] Initiating video call to partnerId:", partnerId);
    initiateCall(partnerId, "video");
  };

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
  const [isSending, setIsSending] = useState(false); // Thêm state để tránh spam

  const { user } = useAuth();

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages for initial load
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetMessagesQuery({
    partnerId: conversation.partnerId,
    page: 1,
    limit: 30,
  });

  // Fetch more messages function
  const fetchMoreMessages = async (page: number) => {
    try {
      setLoadingMore(true);
      const response = await refetchMessages();
      return response;
    } catch (error) {
      console.error("Error fetching more messages:", error);
      return null;
    } finally {
      setLoadingMore(false);
    }
  };

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

  // Mutations
  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

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

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sendingMessage || isSending) return;

    const messageText = newMessage.trim();

    // Prevent spam sending
    setIsSending(true);

    // Stop typing indicator when sending
    sendTypingStop(conversation.partnerId);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

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

      // Reset sending state
      setIsSending(false);
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

      // Reset sending state
      setIsSending(false);
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
    if (displayMessages.length > 0 && isInitialLoad) {
      scrollToBottom();
      setIsInitialLoad(false);
    }
  }, [displayMessages, isInitialLoad]);

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

  // Mark messages as read when opening conversation
  React.useEffect(() => {
    if (conversation.unread > 0) {
      markAsRead({ partnerId: conversation.partnerId });
    }
  }, [conversation.partnerId, conversation.unread, markAsRead]);

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

  // Handle input change với typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Send typing start khi bắt đầu gõ
    if (value.length > 0 && !newMessage) {
      sendTypingStart(conversation.partnerId);
    }

    // Send typing stop khi xóa hết
    if (value.length === 0 && newMessage.length > 0) {
      sendTypingStop(conversation.partnerId);
    }

    // Auto stop typing sau 1 giây không gõ
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      sendTypingStop(conversation.partnerId);
    }, 1000);
    setTypingTimeout(timeout);
  };

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

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={conversation.avatar}
                  alt={conversation.name}
                />
                <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {conversation.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{conversation.name}</h2>
              <p className="text-sm text-muted-foreground">
                {conversation.online ? "Đang hoạt động" : "Không hoạt động"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={makeVoiceCall}
              title="Gọi thoại"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={makeVideoCall}
              title="Gọi video"
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        onScroll={handleScroll}
      >
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Đang tải tin nhắn...
              </p>
            </div>
          </div>
        ) : messagesError ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500 text-sm">Lỗi tải tin nhắn</p>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>
        ) : (
          <>
            {/* Loading more messages indicator */}
            {loadingMore && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
                  <span className="text-sm text-muted-foreground">
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
                    <div className="flex justify-center my-4">
                      <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
                        {formatTimeSeparator(message.createdAt)}
                      </div>
                    </div>
                  )}
                  <div
                    className={`flex ${
                      message.sender === "me" ? "justify-end" : "justify-start"
                    } group`}
                  >
                    <div className="flex flex-col">
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
                          message.sender === "me"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                        title={message.timestamp}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      {/* Status indicator chỉ cho tin nhắn mới nhất của mình */}
                      {isMyLatestMessage && message.status && (
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                          {message.status === "sending" && (
                            <span className="flex items-center gap-1 justify-end">
                              <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
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

        {/* Typing indicator */}
        {isPartnerTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-muted text-foreground px-4 py-2 rounded-2xl max-w-xs">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {conversation.name} đang soạn tin nhắn
                </span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button - overlay, fixed above input */}
      {showScrollButton && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-fade-in z-10">
          <Button
            size="icon"
            className="h-9 w-9 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Aa"
              value={newMessage}
              onChange={handleInputChange}
              disabled={sendingMessage}
              className="pr-12"
              tabIndex={0}
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            >
              <span className="text-lg">😊</span>
            </Button>
          </div>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={!newMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
