'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { getInboxChat, getMessages } from '@/app/actions'
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
import type { Message } from '@/types/database'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
}

export function Chat({ initialMessages, className }: ChatProps) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const [isEditing, setIsEditing] = useState(false)

  const chatStore = useChatStore()

  const { messages, ...props } = useChat({
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

  const onSessionStatusChange = useCallback(
    (status: string) => {
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
          setInboxChat()
        }
      }
    },
    [chatStore, pathname, props, router, search, setInboxChat]
  )

  // Handle user login status change
  const status = useSessionStatusEffect(onSessionStatusChange)

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
      <section className={cn('pt-2', className)}>
        {status != 'authenticated' && <NotLogin />}
        {chatStore.pinPrompt && <PinPrompt content={chatStore.pinPrompt} />}
        {status === 'authenticated' && messages.length === 0 && (
          <EmptyScreen setInput={props.setInput} />
        )}
        <div className="relative mx-auto w-screen px-1 md:max-w-2xl md:px-4">
          <ChatList messages={messages} {...props} />
          {props.input.trim().length > 0 && (
            <>
              <Separator className="my-1"></Separator>
              <ChatMessage role={Role.User} content={props.input} />
            </>
          )}
        </div>
        <ButtonScrollToBottom className="fixed bottom-60 right-2 z-10" />
        <ChatScrollAnchor trackVisibility={props.isLoading || isEditing} />
      </section>
      {status != 'authenticated' ? (
        <ChatLoginPanel className="mt-auto" setMessages={props.setMessages} />
      ) : (
        <ChatPanel
          className="sticky bottom-0 mt-auto"
          id={chatStore.id}
          messages={messages}
          {...props}
        />
      )}
    </>
  )
}
