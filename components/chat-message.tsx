// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from 'ai'

import { cn } from '@/lib/utils'
import { Markdown } from '@/components/markdown'
import {
  ChatMessageActions,
  ChatMessageActionsProps
} from '@/components/chat-message-actions'
import { RobotAvatar, UserAvatar } from './ui/avatar'
import BubblesLoading from './ui/loading'
import Timestamp from './ui/timestamp'

export interface ChatMessageProps extends ChatMessageActionsProps {
  isLoading?: boolean
}

const ChatAvatar = ({ role }: { role: Message['role'] }) => {
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
        role.includes('user') ? 'bg-background' : 'bg-theme-gradient'
      )}
    >
      {role.includes('user') ? (
        <UserAvatar className="h-8 w-8 p-1" />
      ) : (
        <RobotAvatar className="h-8 w-8 p-1" />
      )}
    </div>
  )
}

export function ChatMessage({ isLoading, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn('group relative mb-8 flex flex-col items-start md:-ml-12')}
    >
      <div className="flex w-full items-center">
        <ChatMessageActions
          className="mr-2 flex-1 group-hover:opacity-100 md:opacity-0"
          {...props}
        />
        <Timestamp full date={props.createdAt} className="text-primary/50" />
      </div>
      <div className="flex w-full">
        <ChatAvatar role={props.role} />
        <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
          {props.content ? (
            <Markdown content={props.content} />
          ) : isLoading ? (
            <BubblesLoading />
          ) : null}
        </div>
      </div>
    </div>
  )
}
