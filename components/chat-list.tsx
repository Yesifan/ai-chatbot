import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { UseChatHelpers } from '@/types/ai'
import { removeMessage } from '@/app/actions'
import { Role } from '@/lib/constants'

export interface ChatListProps
  extends Pick<
    UseChatHelpers,
    'messages' | 'reload' | 'remove' | 'isLoading' | 'streamData'
  > {}

/**
 * show chat messages
 * @param messages
 */
export function ChatList({ messages, ...props }: ChatListProps) {
  const onReload = useCallback(
    async (id: string) => {
      props.reload(id)
    },
    [props]
  )
  const onDelete = useCallback(
    async (id: string) => {
      props.remove(id)
      const res = await removeMessage(id)
      if (res.ok !== true) {
        toast.error(res.error ?? 'delete message failed')
      }
    },
    [props]
  )

  if (!messages.length) {
    return null
  }

  return (
    <>
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage {...message} onDelete={onDelete} onReload={onReload} />
          {index < messages.length - 1 && <Separator className="my-1" />}
        </div>
      ))}
      {props.isLoading && (
        <>
          {messages.length > 0 && <Separator className="my-1" />}
          <ChatMessage
            role={Role.Assistant}
            content={props.streamData}
            isLoading={true}
          />
        </>
      )}
    </>
  )
}
