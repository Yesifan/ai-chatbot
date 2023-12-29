'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'

import { getChats } from '@/app/actions/chat'
import { clearChats, removeChat, updateChat } from '@/app/actions'
import { RemoveActions } from '@/components/remove-actions'
import { ChatItem } from './chat-item'
import type { Chat } from '@/types/database'
import { NewChatButton } from './new-chat-button'
import { cn } from '@/lib/utils'
import { ClearHistory } from './clear-history'
import toast from 'react-hot-toast'

interface HistoryChatListProps {
  robotId?: string
  initalChats?: Chat[]
  className?: string
}

export function HistoryChatList({
  robotId,
  initalChats,
  className
}: HistoryChatListProps) {
  const { data: session, status } = useSession()
  const [isLoading, starTransition] = useTransition()
  const [chats, setChats] = useState<Chat[]>(initalChats ?? [])

  const getChatList = useCallback(async () => {
    starTransition(async () => {
      const chats = await getChats(robotId)
      setChats(chats)
    })
  }, [starTransition, robotId])

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
    if (result.ok) {
      setChats(chats => chats.filter(chat => chat.id !== id))
    }
    return result
  }

  useEffect(() => {
    if (status === 'authenticated' && session.user.id) {
      getChatList()
    } else {
      setChats([])
    }
  }, [status, session?.user.id, getChatList])

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
        onClick={getChatList}
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
