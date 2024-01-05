'use client'

import { useTransition } from 'react'

import { createChat } from '@/app/actions/chat'
import { Button, ButtonProps } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import BubblesLoading from '@/components/ui/loading'
import { DEFAULT_CHAT_NAME } from '@/lib/constants'

interface NewChatProps extends ButtonProps {
  robotId?: string
  isLoading?: boolean
}

export function NewChatButton({
  robotId,
  isLoading,
  onClick,
  ...props
}: NewChatProps) {
  const route = useRouter()
  const [loading, starTransition] = useTransition()

  const createNewChat: React.MouseEventHandler<
    HTMLButtonElement
  > = async event => {
    starTransition(async () => {
      const chat = await createChat(DEFAULT_CHAT_NAME, robotId)
      if ('error' in chat) {
        toast(chat.error)
      } else {
        route.push(`/chat/${chat.id}`)
        onClick?.(event)
      }
    })
  }

  return (
    <Button
      variant="outline"
      onClick={createNewChat}
      disabled={isLoading || loading}
      {...props}
    >
      {isLoading || loading ? <BubblesLoading /> : 'New Chat 💬'}
    </Button>
  )
}
