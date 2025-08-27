"use client";

import { useState } from "react";
import { Search, Edit, Phone, Video, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
  read: boolean;
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Bình Phương",
    avatar: "/anime-style-avatar-girl.png",
    lastMessage: "đi bò cả 10p • 1 ngày",
    timestamp: "1 ngày",
    unread: 0,
    online: true,
  },
  {
    id: "2",
    name: "Hương Giang Trần",
    avatar: "/anime-style-avatar-woman.png",
    lastMessage: "Tài khoản này không cho phép mọi ngư... • 1 tuần",
    timestamp: "1 tuần",
    unread: 2,
    online: false,
  },
  {
    id: "3",
    name: "Tấn Đăng",
    avatar: "/anime-style-avatar-boy.png",
    lastMessage: "Bạn đã gửi một video • 3 tuần",
    timestamp: "3 tuần",
    unread: 0,
    online: true,
  },
  {
    id: "4",
    name: "Vi Na",
    avatar: "/anime-style-avatar-woman-2.png",
    lastMessage: "Bạn ❤️ • 9 tuần",
    timestamp: "9 tuần",
    unread: 0,
    online: false,
  },
  {
    id: "5",
    name: "Khánh Tâm",
    avatar: "/anime-style-avatar-man.png",
    lastMessage: "Tài khoản này không cho phép mọi ngư... • 11 tuần",
    timestamp: "11 tuần",
    unread: 1,
    online: true,
  },
  {
    id: "6",
    name: "Anh Thư",
    avatar: "/anime-style-avatar-girl-2.png",
    lastMessage: "Bạn: sao hình như cũng tốt vậy • 14 tuần",
    timestamp: "14 tuần",
    unread: 0,
    online: false,
  },
];

const sampleMessages: Message[] = [
  {
    id: "1",
    text: "Chào bạn! Bạn có khỏe không?",
    sender: "other",
    timestamp: "10:30",
    read: true,
  },
  {
    id: "2",
    text: "Mình khỏe, cảm ơn bạn! Bạn thì sao?",
    sender: "me",
    timestamp: "10:32",
    read: true,
  },
  {
    id: "3",
    text: "Mình cũng tốt. Hôm nay bạn có rảnh không?",
    sender: "other",
    timestamp: "10:35",
    read: true,
  },
  {
    id: "4",
    text: "Có chứ, bạn muốn làm gì?",
    sender: "me",
    timestamp: "10:37",
    read: false,
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const { t } = useLanguage();

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">huybrox_04</h1>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm"
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
              <span className="text-sm font-medium">Tin nhắn</span>
              <span className="text-sm text-muted-foreground">
                Tin nhắn đang chờ
              </span>
            </div>

            {filteredConversations.map((conversation) => (
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
                      src={conversation.avatar || "/placeholder.svg"}
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
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedConv?.avatar || "/placeholder.svg"}
                        alt={selectedConv?.name}
                      />
                      <AvatarFallback>
                        {selectedConv?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConv?.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedConv?.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedConv?.online
                        ? "Đang hoạt động"
                        : "Không hoạt động"}
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
              {sampleMessages.map((message) => (
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
                    placeholder="Aa"
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
              <h2 className="text-xl font-semibold mb-2">Tin nhắn của bạn</h2>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Gửi tin nhắn
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
