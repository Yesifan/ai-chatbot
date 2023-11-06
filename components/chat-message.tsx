// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from 'ai'

import { cn } from '@/lib/utils'
import { Markdown } from '@/components/markdown'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { RobotAvatar, UserAvatar } from './ui/avatar'
import BubblesLoading from './ui/loading'

export interface ChatMessageProps extends Omit<Message, 'id'> {
  id?: string
  isLoading?: boolean
}

const ChatAvatar = ({ role }: { role: Message['role'] }) => {
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
        role.includes('user') && 'bg-background'
      )}
    >
      {role.includes('user') ? <UserAvatar /> : <RobotAvatar />}
    </div>
  )
}

export function ChatMessage({
  id,
  role,
  content,
  isLoading
}: ChatMessageProps) {
  return (
    <div
      className={cn('group relative mb-8 flex flex-col items-start md:-ml-12')}
    >
      {id && (
        <ChatMessageActions
          className="w-full"
          id={id}
          role={role}
          content={content}
        />
      )}
      <div className="flex">
        <ChatAvatar role={role} />
        <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
          {content ? (
            <Markdown content={content} />
          ) : isLoading ? (
            <BubblesLoading />
          ) : null}
        </div>
      </div>
    </div>
  )
}
