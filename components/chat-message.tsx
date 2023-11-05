// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from 'ai'

import { cn } from '@/lib/utils'
import { Markdown } from '@/components/markdown'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { RobotAvatar, UserAvatar } from './ui/avatar'

export interface ChatMessageProps extends Omit<Message, 'id'> {
  id?: string
}

export function ChatMessage({
  id,
  role,
  content,
  createdAt,
  ...props
}: ChatMessageProps) {
  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          role.includes('user') && 'bg-background'
        )}
      >
        {role.includes('user') ? <UserAvatar /> : <RobotAvatar />}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <Markdown content={content} />
        {id && <ChatMessageActions id={id} role={role} content={content} />}
      </div>
    </div>
  )
}
