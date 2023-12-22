'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import { getChats, removeChat } from '@/app/actions'
import { ChatItemActions } from '@/components/history-chat-actions'
import { ChatItem } from '@/components/history-chat-item'
import type { Chat } from '@/types/database'
import { NewChatButton } from './new-chat-button'
import { cn } from '@/lib/utils'

interface HistoryChatListProps {
  initalChats?: Chat[]
  className?: string
}

export function HistoryChatList({
  initalChats,
  className
}: HistoryChatListProps) {
  const { data: session, status } = useSession()
  const [isLoading, setLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>(initalChats ?? [])

  const updateChats = async () => {
    setLoading(true)
    const chats = await getChats()
    setChats(chats)
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'authenticated' && session.user.id) {
      updateChats()
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
      <div className={cn('flex flex-1 flex-col', className)}>
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Please login in first</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-1 flex-col', className)}>
      <NewChatButton
        isLoading={isLoading}
        className="mx-2"
        variant="outline"
        onClick={updateChats}
      />
      <div className="flex-1 space-y-2 overflow-auto px-2 pt-2">
        {chats.map(chat => (
          <ChatItem key={chat?.id} chat={chat}>
            <ChatItemActions id={chat.id} removeChat={removeChatHandler} />
          </ChatItem>
        ))}
      </div>
    </div>
  )
}
