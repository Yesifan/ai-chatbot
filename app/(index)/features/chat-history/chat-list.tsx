'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import { clearChats, getChats, removeChat, updateChat } from '@/app/actions'
import { RemoveActions } from '@/components/remove-actions'
import { ChatItem } from './chat-item'
import type { Chat } from '@/types/database'
import { NewChatButton } from './new-chat-button'
import { cn } from '@/lib/utils'
import { ClearHistory } from './clear-history'
import toast from 'react-hot-toast'

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

  const updateChatList = async () => {
    setLoading(true)
    const chats = await getChats()
    setChats(chats)
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'authenticated' && session.user.id) {
      updateChatList()
    } else {
      setChats([])
    }
  }, [status, session?.user.id])

  const favoriteChatHandler = async (id: string, isFavourite: boolean) => {
    const result = await updateChat(id, { isFavourite })
    if (result.ok) {
      setChats(chats =>
        chats.map(chat => (chat.id === id ? { ...chat, isFavourite } : chat))
      )
      return true
    } else {
      console.error(result)
      toast.error(result.error || 'Failed to update chat')
      return false
    }
  }

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
        onClick={updateChatList}
      />
      <div className="flex-1 space-y-2 overflow-auto px-2 pt-2">
        {chats.map(chat => (
          <ChatItem key={chat?.id} chat={chat} favorite={favoriteChatHandler}>
            <RemoveActions id={chat.id} remove={removeChatHandler} />
          </ChatItem>
        ))}
      </div>
      <div className={cn('flex items-center p-4')}>
        <ClearHistory clearChats={clearChats} />
      </div>
    </div>
  )
}
