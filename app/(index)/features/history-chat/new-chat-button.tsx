'use client'

import { useState } from 'react'

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
  const [loading, setLoading] = useState(false)

  const createNewChat: React.MouseEventHandler<
    HTMLButtonElement
  > = async event => {
    setLoading(true)
    const chat = await createChat()
    if ('error' in chat) {
      toast(chat.error)
    } else {
      route.push(`/chat/${chat.id}`)
      onClick?.(event)
    }
    setLoading(false)
  }

  return (
    <Button {...props} onClick={createNewChat} disabled={isLoading || loading}>
      {isLoading || loading ? <BubblesLoading /> : 'New Chat 💬'}
    </Button>
  )
}
