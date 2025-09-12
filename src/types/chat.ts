export interface Message {
  id: string
  text: string
  sender: "me" | "other"
  timestamp: Date
  read?: boolean
}

export interface ChatWindow {
  id: string
  name: string
  avatar: string
  online: boolean
  messages: Message[]
  typing?: boolean
  unreadCount?: number
}

export interface ChatDockProps {
  // Add props if needed
}
