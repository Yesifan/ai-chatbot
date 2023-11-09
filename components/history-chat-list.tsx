'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import { getChats, removeChat } from '@/app/actions'
import { ChatItemActions } from '@/components/history-chat-actions'
import { ChatItem } from '@/components/history-chat-item'
import type { Chat } from '@/types/chat'
import BubblesLoading from './ui/loading'

interface HistoryChatListProps {
  initalChats?: Chat[]
}

export function HistoryChatList({initalChats}: HistoryChatListProps) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>(initalChats ?? [])

  useEffect(() => {
    if (status === 'authenticated' && session.user.id) {
      setLoading(true)
      getChats()
        .then(chats => setChats(chats))
        .finally(() => setLoading(false))
    } else {
      setChats([])
    }
  }, [status, session?.user.id])

  const removeChatHandler = async (id: string) => {
    const result = await removeChat(id)
    if (typeof result === 'bigint') {
      setChats(chats => chats.filter(chat => chat.id !== id))
    }
    return result
  }

  if (status !== 'authenticated') {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Please log in first</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8 text-center">
          <BubblesLoading />
        </div>
      </div>
    )
  }

  if (!chats?.length) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-2 px-2 pt-2">
        {chats.map(chat => (
          <ChatItem key={chat?.id} chat={chat}>
            <ChatItemActions id={chat.id} removeChat={removeChatHandler} />
          </ChatItem>
        ))}
      </div>
    </div>
  )
}
