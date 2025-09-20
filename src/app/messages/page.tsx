"use client";

import { useState, useMemo } from "react";
import { Search, Edit, Phone, Video, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/useAuth";
import { useGetConversationsQuery } from "@/store/services/messageApi";
import { ConversationUI } from "@/types/message";
import { ChatArea } from "@/components/chat";

// Utility function để format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours =
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 168) {
    // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days} ngày`;
  } else {
    const weeks = Math.floor(diffInHours / 168);
    return `${weeks} tuần`;
  }
};

// Transform API data to UI format
const transformConversationToUI = (
  conversation: any,
  currentUserId: string
): ConversationUI => {
  // Tìm partner (không phải mình)
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
    timestamp: formatTimestamp(conversation.updatedAt),
    unread: conversation.unreadCount,
    online: false, // TODO: Implement online status from socket
    partnerId: partner?._id || "",
  };
};

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const { t } = useLanguage();
  const { user } = useAuth();

  // Fetch conversations từ API
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useGetConversationsQuery(
    { page: 1, limit: 20 },
    {
      // Refetch every 30 seconds to get new conversations
      pollingInterval: 30000,
      refetchOnMountOrArgChange: true,
    }
  );

  // Transform data và filter theo search
  const conversations = useMemo(() => {
    if (!conversationsData?.data?.items || !user?._id) return [];

    return conversationsData.data.items.map((conv) =>
      transformConversationToUI(conv, user._id)
    );
  }, [conversationsData, user?._id]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  // Sample messages for demo
  const sampleMessages = [
    { id: 1, text: "Xin chào! Bạn có khỏe không?", sender: "other" },
    { id: 2, text: "Chào bạn! Tôi khỏe, cảm ơn bạn!", sender: "me" },
    { id: 3, text: "Hôm nay thời tiết đẹp quá nhỉ?", sender: "other" },
    { id: 4, text: "Đúng rồi, thích hợp để đi dạo", sender: "me" },
  ];

  // Loading state
  if (conversationsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Đang tải cuộc hội thoại...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (conversationsError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Lỗi tải cuộc hội thoại</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">
              {user?.username || "Messages"}
            </h1>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("messages.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">{t("messages.inbox.title")}</span>
              <span className="text-sm text-muted-foreground">{t("messages.inbox.pending")}</span>
              <span className="text-sm font-medium">Tin nhắn</span>
              <span className="text-sm text-muted-foreground">
                {filteredConversations.length > 0
                  ? `${filteredConversations.length} cuộc hội thoại`
                  : "Không có cuộc hội thoại"}
              </span>
            </div>

            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? "Không tìm thấy cuộc hội thoại nào"
                    : "Chưa có cuộc hội thoại nào"}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => refetchConversations()}
                  >
                    Làm mới
                  </Button>
                )}
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation === conversation.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={conversation.avatar}
                        alt={conversation.name}
                      />
                      <AvatarFallback>
                        {conversation.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {conversation.unread > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {conversation.unread}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          selectedConv.avatar ||
                          "/images/placeholders/placeholder.svg"
                        }
                        alt={selectedConv.name}
                      />
                      <AvatarFallback>
                        {selectedConv.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConv.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedConv.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedConv.online
                        ? t("messages.status.online")
                        : t("messages.status.offline")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {sampleMessages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder={t("messages.input.placeholder")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  >
                    <span className="text-lg">😊</span>
                  </Button>
                </div>
                <Button variant="ghost" size="icon">
                  <span className="text-lg">👍</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-muted flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Edit className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">{t("messages.empty.title")}</h2>
              <p className="text-muted-foreground mb-4 max-w-sm">
                {t("messages.empty.subtitle")}
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                {t("messages.empty.cta")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
