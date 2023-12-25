'use client'

import React, { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { getChat, getInboxChat, getMessages } from '@/app/actions'
import { Separator } from './ui/separator'
import { Role } from '@/lib/constants'
import { useChat } from '@/lib/hooks/use-chat'
import { useChatStore } from '@/lib/store/chat'
import { useSessionStatusEffect } from '@/lib/hooks/use-login'
import { NotLogin } from './not-login'
import { PinPrompt } from './pin-prompt'
import { ChatMessage } from './chat-message'
import { ChatLoginPanel } from './chat-panel/chat-login-panel'
import { ButtonScrollToBottom } from './button-scroll-to-bottom'
import { ButtonReload } from './reload-button'
import { Button } from './ui/button'
import { IconMessages } from './ui/icons'
import { HistoryChatList } from './history-chat-list'
import type { Chat, Message } from '@/types/database'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
}

const MessagesButton = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button
    size="icon"
    variant="outline"
    className={cn('bg-background', className)}
    title="chats"
    {...props}
  >
    <IconMessages />
  </Button>
)

const HistoryChatListSidebar = ({
  isShow,
  className
}: {
  isShow?: boolean
  className?: string
}) => (
  <HistoryChatList
    className={cn(
      'w-60 bg-gradient-to-br from-background/80 via-background/50 to-background/10 pt-4 backdrop-blur-xl',
      'fixed bottom-56 right-0 top-[calc(4rem+env(safe-area-inset-top))] z-10',
      'transition-transform',
      isShow ? ' translate-x-0' : 'translate-x-full',
      className
    )}
  />
)

export function Chat({ initialMessages, className }: ChatProps) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const [isEditing, setIsEditing] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)
  const [isInitialize, startTransition] = useTransition()

  const chatStore = useChatStore()

  const { messages, isLoading, ...props } = useChat({
    initialMessages: initialMessages,
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText)
      }
    }
  })

  const setInboxChat = useCallback(async () => {
    // TODO: Add get chat Loading
    const chat = await getInboxChat()
    if ('error' in chat) {
      console.error('[IndexPage] get chat', chat.error)
      return
    }
    chatStore.update?.(chat)
    const messages = await getMessages(chat.id)
    if ('error' in messages) {
      console.error('[IndexPage] get message', messages.error)
      return
    }
    props.setMessages(messages)
  }, [chatStore, props])

  const reloadChat = useCallback(async () => {
    try {
      if (chatStore.id) {
        const chatAndMessage = await getChat(chatStore.id)
        if (chatAndMessage) {
          const [chat, message] = chatAndMessage
          chatStore.update?.(chat)
          props.setMessages(message)
        } else {
          console.error('[IndexPage] get chat error')
        }
      } else {
        await setInboxChat()
      }
      toast.success('Reload chat success')
    } catch (error) {
      toast.error('Reload chat error')
      console.error('[IndexPage] get chat error', error)
    }
  }, [chatStore, props, setInboxChat])

  // Handle user login status change
  const status = useSessionStatusEffect(async (status: string) => {
    if (status === 'unauthenticated') {
      if (pathname !== '/') {
        router.replace(`/?next=${pathname}`)
      } else {
        chatStore.clear?.()
        props.setMessages([])
      }
    } else if (status === 'authenticated') {
      const nextPath = search.get('next')
      if (nextPath) {
        router.push(nextPath)
      } else {
        startTransition(async () => {
          await setInboxChat()
        })
      }
    }
  })

  useEffect(() => {
    if (props.input.length > 0) {
      setIsEditing(true)
      const delay = setTimeout(() => {
        setIsEditing(false)
      }, 1000)
      return () => clearTimeout(delay)
    }
  }, [props.input.length])

  return (
    <>
      <section className={cn('pt-4', className)}>
        {status != 'authenticated' && <NotLogin />}
        {chatStore.pinPrompt && <PinPrompt content={chatStore.pinPrompt} />}
        {status === 'authenticated' && messages.length === 0 && (
          <EmptyScreen setInput={props.setInput} />
        )}
        {status === 'authenticated' && (
          <HistoryChatListSidebar isShow={hasHistory} />
        )}
        <div className="relative mx-auto w-screen px-1 md:max-w-2xl md:px-4">
          <ChatList messages={messages} isLoading={isLoading} {...props} />
          {props.input.trim().length > 0 && (
            <>
              <Separator className="my-1"></Separator>
              <ChatMessage role={Role.User} content={props.input} />
            </>
          )}
        </div>
        <div className="fixed bottom-60 right-2 z-20 flex flex-col space-y-4">
          <MessagesButton
            onClick={() => setHasHistory(!hasHistory)}
            className={hasHistory ? 'bg-blue-500 text-white' : ''}
          />
          <ButtonReload onClick={reloadChat} isLoading={isInitialize} />
          <ButtonScrollToBottom />
        </div>

        <ChatScrollAnchor trackVisibility={isLoading || isEditing} />
      </section>
      <section className="sticky bottom-0 mt-auto">
        {status != 'authenticated' ? (
          <ChatLoginPanel setMessages={props.setMessages} />
        ) : (
          <ChatPanel
            className="h-56"
            id={chatStore.id}
            messages={messages}
            isLoading={isLoading || isInitialize}
            {...props}
          />
        )}
      </section>
    </>
  )
}
