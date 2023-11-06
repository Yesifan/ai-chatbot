import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { Role } from '@/lib/constants'
import { UseChatHelpers } from '@/types/ai'
import { useCallback } from 'react'
import { removeMessage } from '@/app/actions'
import toast from 'react-hot-toast'

export interface ChatListProps extends UseChatHelpers {}

/**
 * show chat messages
 * @param messages
 */
export function ChatList({
  messages,
  streamData,
  isLoading,
  remove
}: ChatListProps) {
  const onDelete = useCallback(
    async (id: string) => {
      remove(id)
      const res = await removeMessage(id)
      if (res.ok !== true) {
        toast.error(res.error ?? 'delete message failed')
      }
    },
    [remove]
  )

  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage {...message} onDelete={onDelete} />
          {index < messages.length - 1 && <Separator className="my-1" />}
        </div>
      ))}
      {isLoading && (
        <>
          <Separator className="my-4 md:my-8" />
          <ChatMessage
            role={Role.Assistant}
            content={streamData}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  )
}
