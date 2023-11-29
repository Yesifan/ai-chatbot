'use client'

import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useChat } from '@/lib/hooks/use-chat'
import { NotLogin } from './not-login'

import type { Message } from '@/types/database'
import { Separator } from './ui/separator'
import { ChatMessage } from './chat-message'
import { Role } from '@/lib/constants'
import { useChatStore } from '@/lib/store/chat'
import { getInboxChat, getMessages } from '@/app/actions'
import { ScrollProvider } from '@/lib/hooks/use-scroll'
import { ButtonScrollToBottom } from './button-scroll-to-bottom'
import { ChatLoginPanel } from './chat-panel/chat-login-panel'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
}

export function Chat({ initialMessages, className }: ChatProps) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()

  const { status } = useSession()
  const sessionStatusRef = useRef(status)

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

  // Handle user login status change
  useEffect(() => {
    if (sessionStatusRef.current !== status) {
      sessionStatusRef.current = status
      if (status === 'unauthenticated') {
        if (pathname !== '/') {
          router.replace(`/?next=${pathname}`)
        } else {
          chatStore.clear?.()
          props.setMessages([])
        }
      } else if (status === 'authenticated') {
        toast.success('Login success!')
        const nextPath = search.get('next')
        if (nextPath) {
          router.push(nextPath)
        } else {
          setInboxChat()
        }
      }
    }
  }, [pathname, router, props, status, search, setInboxChat, chatStore])

  return (
    <>
      <ScrollProvider className={cn('overflow-y-auto pt-20', className)}>
        <ButtonScrollToBottom className="absolute right-4 top-20 z-10 " />
        {status != 'authenticated' ? (
          <NotLogin />
        ) : (
          messages.length === 0 && <EmptyScreen setInput={props.setInput} />
        )}
        <div className="relative mx-auto w-screen px-1 pb-[200px] pt-[4.5rem] md:max-w-2xl md:px-4">
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
        <ChatLoginPanel className="mt-auto" messages={messages} {...props} />
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
