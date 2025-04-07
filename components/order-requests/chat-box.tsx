"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useClientContext } from "@/context/client-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, User, ShieldAlert } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatMessage } from "@/types/client"

interface ChatBoxProps {
  orderRequestId: string
}

export default function ChatBox({ orderRequestId }: ChatBoxProps) {
  const { addChatMessage, getChatMessages } = useClientContext()
  const { user, isAdmin } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Load messages
  const loadMessages = useCallback(async () => {
    setLoading(true)
    const chatMessages = await getChatMessages(orderRequestId)
    setMessages(chatMessages)
    setLoading(false)

    // Scroll to bottom after messages load
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }, 100)
  }, [orderRequestId, getChatMessages])

  useEffect(() => {
    loadMessages()

    // Set up a polling mechanism to refresh messages every 5 seconds
    // In a production app, you'd use Firebase real-time listeners instead
    // const interval = setInterval(loadMessages, 5000)

    // return () => clearInterval(interval)
  }, [loadMessages, orderRequestId])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    setSending(true)

    try {
      await addChatMessage({
        orderRequestId,
        userId: user.uid,
        userName: user.displayName || user.email || "User",
        content: newMessage.trim(),
        isAdmin: isAdmin,
      })

      setNewMessage("")

      // Refresh messages
      const updatedMessages = await getChatMessages(orderRequestId)
      setMessages(updatedMessages)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <div className="p-3 border-b bg-muted/30 flex items-center">
        <h3 className="font-medium">Chat</h3>
        <span className="text-xs text-muted-foreground ml-2">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div>

      <ScrollArea className="h-[300px] p-3" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <User className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Be the first to send a message</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.userId === user?.uid ? "justify-end" : "justify-start"}`}
              >
                {message.userId !== user?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={message.isAdmin ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}
                    >
                      {message.isAdmin ? <ShieldAlert className="h-4 w-4" /> : getInitials(message.userName)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] ${message.userId === user?.uid ? "order-first" : "order-last"}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.userId === user?.uid ? "You" : message.userName}
                      {message.isAdmin && " (Admin)"}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                  </div>

                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.userId === user?.uid
                        ? "bg-primary text-primary-foreground"
                        : message.isAdmin
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>

                {message.userId === user?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={isAdmin ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}>
                      {isAdmin ? (
                        <ShieldAlert className="h-4 w-4" />
                      ) : (
                        getInitials(user?.displayName || user?.email || "User")
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending || !user}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={sending || !newMessage.trim() || !user}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}

