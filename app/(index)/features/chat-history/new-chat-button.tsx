'use client'

import { useTransition } from 'react'

import { createChat } from '@/app/actions'
import { Button, ButtonProps } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import BubblesLoading from '@/components/ui/loading'

interface NewChatProps extends ButtonProps {
  isLoading?: boolean
}

export function NewChatButton({ isLoading, onClick, ...props }: NewChatProps) {
  const route = useRouter()
  const [loading, starTransition] = useTransition()

  const createNewChat: React.MouseEventHandler<
    HTMLButtonElement
  > = async event => {
    starTransition(async () => {
      const chat = await createChat()
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
