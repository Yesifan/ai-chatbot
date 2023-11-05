import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { Role } from '@/lib/constants'
import { UseChatHelpers } from '@/types/ai'

export interface ChatList extends UseChatHelpers {}

/**
 * show chat messages
 * @param messages
 */
export function ChatList({ messages, streamData, isLoading }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage {...message} />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
      {isLoading && (
        <>
          <Separator className="my-4 md:my-8" />
          {streamData ? (
            <ChatMessage role={Role.Assistant} content={streamData} />
          ) : (
            <div>Loading...</div>
          )}
        </>
      )}
    </div>
  )
}
