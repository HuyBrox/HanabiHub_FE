"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Edit, Phone, Video, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/useAuth";
import { useGetConversationsQuery } from "@/store/services/messageApi";
import {
  useGetUserProfileByIdQuery,
  useGetMyFriendsQuery,
} from "@/store/services/userApi";
import { withAuth } from "@/components/auth";
import { ConversationUI } from "@/types/message";
import { ChatArea } from "@/components/chat";
import { useSocketContext } from "@/providers/SocketProvider";
import { playNotificationSound } from "@/lib/notificationSound";

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

function MessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdFromUrl = searchParams.get("userId");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const { user } = useAuth();
  const { socket, connected } = useSocketContext();

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

  // Fetch friends để lấy online status với polling
  const { data: friendsData } = useGetMyFriendsQuery(undefined, {
    pollingInterval: 30000, // Poll mỗi 30s để update online status
    refetchOnMountOrArgChange: true,
  });

  // Fetch user profile nếu có userId trong URL nhưng chưa có conversation
  const { data: userProfileData, isLoading: userProfileLoading } =
    useGetUserProfileByIdQuery(userIdFromUrl || "", {
      skip: !userIdFromUrl || conversationsLoading,
    });

  // Transform data và filter theo search
  const conversations = useMemo(() => {
    if (!conversationsData?.data?.items || !user?._id) return [];

    const friends = friendsData?.data?.friends || [];

    return conversationsData.data.items.map((conv) => {
      const convUI = transformConversationToUI(conv, user._id);
      // Update online status từ friends list
      const friend = friends.find((f: any) => f._id === convUI.partnerId);
      if (friend) {
        convUI.online = friend.isOnline;
      }
      return convUI;
    });
  }, [conversationsData, user?._id, friendsData]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Tự động chọn conversation dựa trên userId từ URL
  useEffect(() => {
    if (userIdFromUrl && conversations.length > 0) {
      // Tìm conversation có partnerId trùng với userId
      const foundConversation = conversations.find(
        (conv) => conv.partnerId === userIdFromUrl
      );
      if (foundConversation) {
        setSelectedConversation(foundConversation.id);
      }
    } else if (!userIdFromUrl) {
      // Nếu không có userId trong URL, clear selected conversation
      setSelectedConversation(null);
    }
  }, [userIdFromUrl, conversations]);

  // Handler để chọn conversation và cập nhật URL
  const handleSelectConversation = (conversation: ConversationUI) => {
    setSelectedConversation(conversation.id);
    // Cập nhật URL với userId
    router.push(`/messages?userId=${conversation.partnerId}`);
  };

  // Handler để đóng conversation và xóa query parameter
  const handleCloseConversation = () => {
    setSelectedConversation(null);
    router.push("/messages");
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  // Listen to socket for new messages and play sound if not in active conversation
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (payload: {
      messageId: string;
      senderId: string;
      receiverId: string;
      message: string;
      timestamp: string | Date;
    }) => {
      console.log("[MessagesPage] newMessage:", payload);

      // Lấy partnerId của conversation hiện tại
      const currentPartnerId = selectedConv?.partnerId || userIdFromUrl;

      // Nếu tin nhắn KHÔNG từ người đang chat → phát âm thanh
      if (payload.senderId !== currentPartnerId) {
        playNotificationSound();
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, connected, selectedConv, userIdFromUrl]);

  // Tạo conversation tạm từ user profile nếu có userId nhưng chưa có conversation
  const tempConversation: ConversationUI | null = useMemo(() => {
    if (
      userIdFromUrl &&
      !selectedConv &&
      userProfileData?.data &&
      !conversationsLoading
    ) {
      const userProfile = userProfileData.data;
      // Chỉ tạo conversation tạm nếu có quyền nhắn tin
      if (userProfile.canMessage) {
        return {
          id: `temp-${userIdFromUrl}`,
          name: userProfile.fullname || userProfile.username || "Unknown",
          avatar: userProfile.avatar || "/images/placeholders/placeholder.svg",
          lastMessage: "Chưa có tin nhắn",
          timestamp: "",
          unread: 0,
          online: userProfile.isOnline || false,
          partnerId: userIdFromUrl,
        };
      }
    }
    return null;
  }, [userIdFromUrl, selectedConv, userProfileData, conversationsLoading]);

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

  const hasSelectedConversation = selectedConversation || tempConversation;

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Conversations List */}
      <div
        className={`${
          hasSelectedConversation ? "hidden lg:flex" : "flex"
        } w-full lg:w-80 border-r border-border flex-col bg-card`}
      >
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h1 className="text-lg md:text-xl font-semibold">
              {user?.username || "Messages"}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <Edit className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 md:pl-10 bg-muted/50 text-sm h-9 md:h-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center gap-2 mb-3 md:mb-4 px-1">
              <span className="text-xs md:text-sm font-medium">Tin nhắn</span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {filteredConversations.length > 0
                  ? `${filteredConversations.length} cuộc hội thoại`
                  : "Không có cuộc hội thoại"}
              </span>
            </div>

            {filteredConversations.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-muted-foreground text-xs md:text-sm">
                  {searchQuery
                    ? "Không tìm thấy cuộc hội thoại nào"
                    : "Chưa có cuộc hội thoại nào"}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs md:text-sm h-8 md:h-9"
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
                  onClick={() => handleSelectConversation(conversation)}
                  className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation === conversation.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12">
                      <AvatarImage
                        src={conversation.avatar}
                        alt={conversation.name}
                      />
                      <AvatarFallback className="text-xs md:text-sm">
                        {conversation.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-xs md:text-sm truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-2">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5 md:mt-1">
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {conversation.unread > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-4 w-4 md:h-5 md:w-5 p-0 flex items-center justify-center text-xs"
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
      <div
        className={`${
          hasSelectedConversation ? "flex" : "hidden lg:flex"
        } flex-1 flex-col`}
      >
        {selectedConversation && selectedConv ? (
          <div className="flex flex-col h-full">
            {/* Mobile back button */}
            <div className="lg:hidden p-2 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseConversation}
                className="h-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatArea
                conversation={selectedConv}
                onClose={handleCloseConversation}
              />
            </div>
          </div>
        ) : tempConversation && !userProfileLoading ? (
          <div className="flex flex-col h-full">
            {/* Mobile back button */}
            <div className="lg:hidden p-2 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseConversation}
                className="h-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatArea
                conversation={tempConversation}
                onClose={handleCloseConversation}
              />
            </div>
          </div>
        ) : userIdFromUrl &&
          userProfileData?.data &&
          !userProfileData.data.canMessage ? (
          /* No permission to message */
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 rounded-full border-2 border-muted flex items-center justify-center">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Info className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">
                Không thể nhắn tin
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                {userProfileData.data.isPrivate
                  ? "Profile này là riêng tư. Bạn cần follow để nhắn tin."
                  : "Bạn cần follow người dùng này để nhắn tin."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/profile/${userIdFromUrl}`)}
                className="text-xs md:text-sm"
              >
                Xem profile
              </Button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 rounded-full border-2 border-muted flex items-center justify-center">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center">
                  <Edit className="h-4 w-4 md:h-6 md:w-6 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">
                Tin nhắn của bạn
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-xs md:text-sm h-9 md:h-10">
                Gửi tin nhắn
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(MessagesPage);
