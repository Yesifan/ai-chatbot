'use client'

import { useCallback } from 'react'
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
import { ScrollProvider } from '@/lib/hooks/use-scroll'
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

  return (
    <>
      <ScrollProvider className={cn('overflow-y-auto pt-20', className)}>
        <ButtonScrollToBottom className="absolute right-4 top-20 z-10" />
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
        <ChatScrollAnchor trackVisibility={props.isLoading} />
      </ScrollProvider>
      {status != 'authenticated' ? (
        <ChatLoginPanel className="mt-auto" setMessages={props.setMessages} />
      ) : (
        <ChatPanel
          className="mt-auto"
          id={chatStore.id}
          messages={messages}
          {...props}
        />
      )}
    </>
  )
}
