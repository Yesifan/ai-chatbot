'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useChat } from '@/lib/hooks/use-chat'
import { NotLogin } from './not-login'

import type { Message } from '@/types/chat'

export interface ChatProps extends React.ComponentProps<'div'> {
  id: string
  initialMessages?: Message[]
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()

  const { status } = useSession()
  const sessionStatusRef = useRef(status)

  const { messages, ...props } = useChat({
    initialMessages: initialMessages,
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText)
      }
    }
  })

  // Handle user login status change
  useEffect(() => {
    if (sessionStatusRef.current !== status) {
      sessionStatusRef.current = status
      if (status === 'unauthenticated') {
        if (pathname !== '/') {
          router.replace(`/?next=${pathname}`)
        } else {
          props.setMessages([])
        }
      } else if (status === 'authenticated') {
        const nextPath = search.get('next')
        if (nextPath) {
          router.push(nextPath)
        } else {
          props.setMessages([])
        }
      }
    }
  }, [pathname, router, props, status, search])

  return (
    <>
      <div
        className={cn('overflow-y-auto pb-[200px] pt-4 md:pt-10', className)}
      >
        {status != 'authenticated' ? (
          <NotLogin />
        ) : (
          messages.length === 0 && <EmptyScreen setInput={props.setInput} />
        )}
        <ChatList messages={messages} {...props} />
        <ChatScrollAnchor trackVisibility={props.isLoading} />
      </div>
      <ChatPanel id={id} messages={messages} {...props} />
    </>
  )
}
