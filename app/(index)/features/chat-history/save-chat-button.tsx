'use client'

import { useTransition } from 'react'

import { saveChat } from '@/app/actions/chat'
import { Button, ButtonProps } from '@/components/ui/button'
import toast from 'react-hot-toast'
import BubblesLoading from '@/components/ui/loading'
import { INBOX_CHAT } from '@/lib/constants'
import { useRouter } from 'next/navigation'

interface SaveChatProps extends ButtonProps {
  chatId: string
}
export function SaveChatButton({ chatId, ...props }: SaveChatProps) {
  const router = useRouter()
  const [isLoading, starTransition] = useTransition()

  const createNewChat: React.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    starTransition(async () => {
      const chat = await saveChat(chatId)
      if (chat.ok) {
        router.push(`/chat/${chatId}`)
      } else {
        toast.error(chat.message ?? chat.error)
      }
    })
  }

  return (
    <Button
      variant="outline"
      onClick={createNewChat}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <BubblesLoading /> : `Topic ${INBOX_CHAT} ✉️`}
    </Button>
  )
}
