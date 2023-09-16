'use client'

import { useChat, type Message } from 'ai/react'
import { toast } from 'react-hot-toast'
import type { Session } from 'next-auth/types'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { NotLogin } from './not-login'
import { useSession } from 'next-auth/react'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const { data: session } = useSession()
  const { messages, ...props } = useChat({
    id,
    initialMessages,
    body: {
      id
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText)
      }
    }
  })
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {session?.user ? (
          messages.length ? (
            <>
              <ChatList messages={messages} />
              <ChatScrollAnchor trackVisibility={props.isLoading} />
            </>
          ) : (
            <EmptyScreen setInput={props.setInput} />
          )
        ) : (
          <NotLogin />
        )}
      </div>
      <ChatPanel id={id} messages={messages} {...props} />
    </>
  )
}
