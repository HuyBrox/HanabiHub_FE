"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, MessageCircle, Mic, ImageIcon, Heart, Gift, Phone, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "me" | "other"
  timestamp: Date
  read?: boolean
}

interface ChatWindow {
  id: string
  name: string
  avatar: string
  online: boolean
  messages: Message[]
  typing?: boolean
  unreadCount?: number
}

const mockChats: ChatWindow[] = [
  {
    id: "1",
    name: "tú thích khỉa",
    avatar: "/anime-style-avatar-girl.png",
    online: true,
    unreadCount: 3,
    messages: [
      {
        id: "1",
        text: "proposal sai lên sai xuống",
        sender: "other",
        timestamp: new Date(Date.now() - 300000),
        read: true,
      },
      {
        id: "2",
        text: "thì code cứt gì",
        sender: "other",
        timestamp: new Date(Date.now() - 240000),
        read: true,
      },
      {
        id: "3",
        text: "nhóm 4 con bù nhìn",
        sender: "other",
        timestamp: new Date(Date.now() - 180000),
      },
      {
        id: "4",
        text: "nhóm 1 mình tao",
        sender: "other",
        timestamp: new Date(Date.now() - 120000),
      },
      {
        id: "5",
        text: "t nản lắm r",
        sender: "me",
        timestamp: new Date(Date.now() - 60000),
        read: true,
      },
    ],
  },
  {
    id: "2",
    name: "Hải Minh",
    avatar: "/anime-style-avatar-boy.png",
    online: true,
    messages: [
      {
        id: "1",
        text: "=))",
        sender: "other",
        timestamp: new Date(Date.now() - 7200000),
        read: true,
      },
      {
        id: "2",
        text: "là sao",
        sender: "me",
        timestamp: new Date(Date.now() - 7000000),
        read: true,
      },
      {
        id: "3",
        text: "làm sakai hay giấy mà có điểm liền rứa",
        sender: "me",
        timestamp: new Date(Date.now() - 6800000),
        read: true,
      },
      {
        id: "4",
        text: "làm giấy",
        sender: "other",
        timestamp: new Date(Date.now() - 6600000),
        read: true,
      },
      {
        id: "5",
        text: "5 câu",
        sender: "other",
        timestamp: new Date(Date.now() - 6400000),
        read: true,
      },
      {
        id: "6",
        text: "4 tháng làm dc có 1 câu =))",
        sender: "other",
        timestamp: new Date(Date.now() - 6200000),
        read: true,
      },
    ],
  },
  {
    id: "3",
    name: "Minh Tú",
    avatar: "/anime-style-avatar-woman.png",
    online: false,
    messages: [
      {
        id: "1",
        text: "Chào bạn!",
        sender: "other",
        timestamp: new Date(Date.now() - 86400000),
        read: true,
      },
    ],
  },
  {
    id: "4",
    name: "Hoàng Nam",
    avatar: "/anime-style-avatar-man.png",
    online: true,
    messages: [
      {
        id: "1",
        text: "Hẹn gặp lại nhé",
        sender: "me",
        timestamp: new Date(Date.now() - 172800000),
        read: true,
      },
    ],
  },
]

export function ChatDock() {
  const [openChats, setOpenChats] = useState<string[]>(["1", "2"])
  const [hiddenChats, setHiddenChats] = useState<string[]>([])
  const [showChatList, setShowChatList] = useState(false)
  const [newMessage, setNewMessage] = useState<{ [key: string]: string }>({})

  const openChat = (chatId: string) => {
    if (openChats.includes(chatId)) return

    const newOpenChats = [...openChats]

    if (newOpenChats.length >= 3) {
      const oldestChat = newOpenChats.shift()
      if (oldestChat) {
        setHiddenChats((prev) => [...prev.filter((id) => id !== oldestChat), oldestChat])
      }
    }

    newOpenChats.push(chatId)
    setOpenChats(newOpenChats)
    setHiddenChats(hiddenChats.filter((id) => id !== chatId))
    setShowChatList(false)
  }

  const closeChat = (chatId: string) => {
    setOpenChats(openChats.filter((id) => id !== chatId))
    if (!hiddenChats.includes(chatId)) {
      setHiddenChats([...hiddenChats, chatId])
    }
  }

  const minimizeChat = (chatId: string) => {
    if (!hiddenChats.includes(chatId)) {
      setHiddenChats([...hiddenChats, chatId])
    }
  }

  const sendMessage = (chatId: string) => {
    const message = newMessage[chatId]?.trim()
    if (!message) return

    console.log(`Sending message to ${chatId}: ${message}`)

    setNewMessage({ ...newMessage, [chatId]: "" })
  }

  const handleKeyPress = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(chatId)
    }
  }

  const makeVoiceCall = (chatId: string) => {
    const chat = mockChats.find((c) => c.id === chatId)
    console.log(`Making voice call to ${chat?.name}`)
  }

  const makeVideoCall = (chatId: string) => {
    const chat = mockChats.find((c) => c.id === chatId)
    console.log(`Making video call to ${chat?.name}`)
  }

  return (
    <div className="fixed bottom-0 right-2 md:right-4 z-50 flex items-end gap-1">
      {openChats.map((chatId) => {
        const chat = mockChats.find((c) => c.id === chatId)
        if (!chat) return null

        return (
          <div
            key={chatId}
            className={cn(
              "bg-white border border-gray-200 rounded-t-xl shadow-2xl w-72 sm:w-80 h-[400px] sm:h-[500px]",
              chatId === "1" ? "bg-gradient-to-br from-orange-400 to-red-500" : "bg-white",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between p-2 sm:p-3 rounded-t-xl",
                chatId === "1" ? "bg-orange-500/90 text-white" : "bg-gray-50 border-b border-gray-200",
              )}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                    <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{chat.name}</p>
                  {chat.typing && <p className="text-xs opacity-70">đang nhập...</p>}
                </div>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full",
                    chatId === "1" ? "hover:bg-white/20 text-white" : "hover:bg-gray-200",
                  )}
                  onClick={() => makeVoiceCall(chatId)}
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full",
                    chatId === "1" ? "hover:bg-white/20 text-white" : "hover:bg-gray-200",
                  )}
                  onClick={() => makeVideoCall(chatId)}
                >
                  <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full",
                    chatId === "1" ? "hover:bg-white/20 text-white" : "hover:bg-gray-200",
                  )}
                  onClick={() => closeChat(chatId)}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "flex-1 p-2 sm:p-3 h-[300px] sm:h-[380px] overflow-y-auto space-y-2",
                chatId === "1" ? "bg-gradient-to-br from-orange-400 to-red-500" : "bg-white",
              )}
            >
              {chat.messages.map((message) => (
                <div key={message.id} className={cn("flex", message.sender === "me" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] sm:max-w-[75%] px-3 sm:px-4 py-2 text-xs sm:text-sm leading-relaxed",
                      message.sender === "me"
                        ? chatId === "1"
                          ? "bg-red-600 text-white rounded-2xl rounded-br-md"
                          : "bg-blue-500 text-white rounded-2xl rounded-br-md"
                        : "bg-gray-200 text-gray-800 rounded-2xl rounded-bl-md",
                    )}
                  >
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}

              {chat.typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-600 px-3 sm:px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className={cn(
                "p-2 sm:p-3 border-t",
                chatId === "1" ? "bg-orange-500/90 border-orange-400" : "bg-white border-gray-200",
              )}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full",
                    chatId === "1" ? "hover:bg-white/20 text-white" : "hover:bg-gray-100 text-gray-600",
                  )}
                >
                  <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full",
                    chatId === "1" ? "hover:bg-white/20 text-white" : "hover:bg-gray-100 text-gray-600",
                  )}
                >
                  <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hidden sm:flex",
                    chatId === "1" ? "hover:bg-white/20 text-white" : "hover:bg-gray-100 text-gray-600",
                  )}
                >
                  <Gift className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hidden sm:flex",
                    chatId === "1" ? "hover:bg-white/20 text-white" : "hover:bg-gray-100 text-blue-500",
                  )}
                >
                  <span className="text-xs sm:text-sm font-bold">GIF</span>
                </Button>
                <Input
                  placeholder="Aa"
                  value={newMessage[chatId] || ""}
                  onChange={(e) => setNewMessage({ ...newMessage, [chatId]: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, chatId)}
                  className={cn(
                    "flex-1 h-7 sm:h-8 text-xs sm:text-sm border-0 rounded-full px-3 sm:px-4",
                    chatId === "1" ? "bg-white/90 placeholder:text-gray-500" : "bg-gray-100 placeholder:text-gray-500",
                  )}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full",
                    chatId === "1" ? "hover:bg-white/20 text-white" : "hover:bg-gray-100 text-blue-500",
                  )}
                  onClick={() => sendMessage(chatId)}
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      {showChatList && (
        <div className="absolute bottom-16 sm:bottom-20 right-0 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 sm:max-h-96 overflow-y-auto">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Tin nhắn</h3>
          </div>
          <div className="p-1 sm:p-2">
            {mockChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => openChat(chat.id)}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{chat.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.messages[chat.messages.length - 1]?.text || "Không có tin nhắn"}
                  </p>
                </div>
                {chat.unreadCount && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3 sm:mb-4 ml-1 sm:ml-2">
        <Button
          size="lg"
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 shadow-lg"
          onClick={() => setShowChatList(!showChatList)}
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          {hiddenChats.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
              {hiddenChats.length}
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
