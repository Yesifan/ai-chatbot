'use client'
import toast from 'react-hot-toast'
import { useAtomValue } from 'jotai'
import { useCallback, useState, useTransition } from 'react'

import { cn } from '@/lib/utils'
import { createChat, getChats, saveChat } from '@/app/actions/chat'
import { RemoveActions } from '@/components/remove-actions'
import { clearRobotChats, removeChat, updateChat } from '@/app/actions/chat'
import { ChatItem } from './chat-item'
import type { Chat } from '@/types/database'
import { ClearHistory } from './clear-history'
import { useParams, useRouter } from 'next/navigation'
import { DEFAULT_CHAT_NAME } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { SaveAction } from '@/components/save-action'
import { chatSidebarStateAtom } from '@/lib/store/global'
import { useSessionStatusEffect } from '@/lib/hooks/use-login'
import { ChatSidebarHeader } from './chat-sidebar-header'

interface HistoryChatListProps {
  chats?: Chat[]
  className?: string
}

export function ChatSidebar({
  chats: _chats,
  className
}: HistoryChatListProps) {
  const router = useRouter()
  const isChatSidebar = useAtomValue(chatSidebarStateAtom)
  const { robot: robotId } = useParams<{ robot?: string }>()

  const [isLoading, starTransition] = useTransition()

  const [chats, setChats] = useState<Chat[] | undefined>(_chats)

  const reloadChats = useCallback(async () => {
    starTransition(async () => {
      const chats = await getChats(robotId)
      setChats(chats)
    })
  }, [starTransition, robotId])

  const createChatHndler = () => {
    starTransition(async () => {
      const chat = await createChat(DEFAULT_CHAT_NAME, robotId, true)
      if ('error' in chat) {
        toast(chat.error)
      } else {
        router.push(`/chat/${robotId}/${chat.id}`)
        await reloadChats()
      }
    })
  }

  const clearChatHandle = () => {
    if (robotId) {
      return clearRobotChats(robotId)
    } else {
      return Promise.reject({ ok: false, error: 'Not Found' })
    }
  }

  const saveChatHandler = async (id: string) => {
    const result = await saveChat(id)
    if (result.ok) {
      router.push(`/chat/${robotId}/${id}`)
      return true
    } else {
      toast.error(result.error || 'Failed to update chat')
      return false
    }
  }

  const favoriteChatHandler = async (id: string, isFavourite: boolean) => {
    const result = await updateChat(id, { isFavourite })
    if (result.ok) {
      setChats(chats =>
        chats?.map(chat => (chat.id === id ? { ...chat, isFavourite } : chat))
      )
      return true
    } else {
      toast.error(result.error || 'Failed to update chat')
      return false
    }
  }

  const removeChatHandler = async (id: string) => {
    const result = await removeChat(id)
    if (result.ok) {
      setChats(chats => chats?.filter(chat => chat.id !== id))
    }
    return result
  }

  const status = useSessionStatusEffect(() => {
    if (status === 'authenticated') {
      reloadChats()
    } else {
      setChats([])
    }
  })

  return (
    <section
      className={cn(
        'overflow-hidden border-l bg-background transition-all',
        'fixed right-0 z-10 h-screen w-full md:sticky md:top-0 md:w-80',
        isChatSidebar && status !== 'unauthenticated' ? '' : 'w-0 md:w-0',
        className
      )}
    >
      {status !== 'unauthenticated' && (
        <aside className="flex h-full w-full flex-col md:w-80">
          <ChatSidebarHeader className="mb-2" />
          <Button
            variant="outline"
            className="mx-2 mb-2"
            isLoading={isLoading}
            onClick={createChatHndler}
          >
            New Chat 💬
          </Button>

          <div className="flex-1 space-y-2 overflow-auto px-2 pt-2">
            {chats ? (
              chats.map(chat => (
                <ChatItem
                  key={chat?.id}
                  chat={chat}
                  favorite={favoriteChatHandler}
                >
                  {chat.isSaved ? (
                    <RemoveActions id={chat.id} remove={removeChatHandler} />
                  ) : (
                    <SaveAction id={chat.id} save={saveChatHandler} />
                  )}
                </ChatItem>
              ))
            ) : (
              <div> retry get chats. </div>
            )}
          </div>
          <div className={cn('flex items-center p-4')}>
            <ClearHistory clearChats={clearChatHandle} />
          </div>
        </aside>
      )}
    </section>
  )
}
