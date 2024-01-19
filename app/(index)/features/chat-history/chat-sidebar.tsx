'use client'
import React from 'react'
import toast from 'react-hot-toast'
import { useAtom, useAtomValue } from 'jotai'
import { useParams, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { DEFAULT_CHAT_NAME, INBOX_PATH } from '@/lib/constants'
import { useSessionStatusEffect } from '@/lib/hooks/use-login'
import { chatListAtom, chatSidebarToogleAtom } from '@/lib/store/global'
import { createChat, getChats, saveChat } from '@/app/actions/chat'
import { clearRobotChats, removeChat, updateChat } from '@/app/actions/chat'

import { Button } from '@/components/ui/button'
import { SaveAction } from '@/components/save-action'
import { ButtonReload } from '@/components/reload-button'
import { RemoveActions } from '@/components/remove-actions'
import { ChatItem } from './chat-item'
import { ClearHistory } from './clear-history'
import { ChatSidebarHeader } from './chat-sidebar-header'
import type { Chat } from '@/types/database'

interface HistoryChatListProps {
  initialChats?: Chat[]
  className?: string
}

export function ChatSidebar({ initialChats, className }: HistoryChatListProps) {
  const router = useRouter()

  const [chats, setChats] = useAtom(chatListAtom)
  const isChatSidebar = useAtomValue(chatSidebarToogleAtom)
  const { robot: _robotId, chat: chatId } = useParams<{
    robot?: string
    chat?: string
  }>()
  const robotId = _robotId === INBOX_PATH ? undefined : _robotId

  const [isLoading, starTransition] = React.useTransition()

  React.useEffect(() => {
    setChats(initialChats)
  }, [initialChats, setChats])

  const reloadChats = React.useCallback(async () => {
    starTransition(async () => {
      const chats = await getChats(robotId)
      setChats(chats)
    })
  }, [robotId, setChats])

  const createChatHndler = () => {
    starTransition(async () => {
      const chat = await createChat(DEFAULT_CHAT_NAME, robotId, true)
      if ('error' in chat) {
        toast(chat.error)
      } else {
        const robot = robotId ?? INBOX_PATH
        router.push(`/chat/${robot}/${chat.id}`)
        setChats(chats => {
          if (chats) {
            const [chatIndex, ...otherChats] = chats
            return [chatIndex, chat, ...otherChats]
          } else {
            return [chat]
          }
        })
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
    if ('error' in result) {
      toast.error(result.error || 'Failed to update chat')
      return false
    } else {
      const robot = robotId ?? INBOX_PATH
      router.push(`/chat/${robot}/${id}`)
      setChats(chats => {
        const oldChat =
          chats?.map(chat =>
            chat.id === id ? { ...chat, isSaved: true } : chat
          ) ?? []
        return [result, ...oldChat]
      })
      return true
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
      if (chatId === id) {
        router.push(robotId ? `/chat/${robotId}` : '/')
      }
      toast.success('Chat and messages deleted')
    } else {
      toast.error(result.error || 'Failed to remove chat')
    }
  }

  const status = useSessionStatusEffect(() => {
    if (status === 'authenticated') {
      reloadChats()
    } else {
      setChats([])
    }
  })

  if (status === 'unauthenticated') return null

  return (
    <section
      className={cn(
        'overflow-hidden border-l bg-background transition-all',
        'fixed right-0 z-10 h-screen w-full md:top-0 md:w-80 lg:sticky',
        isChatSidebar ? '' : 'w-0 md:w-0',
        className
      )}
    >
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
            <Button variant="ghost" onClick={reloadChats}>
              Retry get chats.
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 p-4">
          <ButtonReload onClick={reloadChats} isLoading={isLoading} />
          <ClearHistory clearChats={clearChatHandle} />
        </div>
      </aside>
    </section>
  )
}
