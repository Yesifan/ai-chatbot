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
import { Role } from '@/lib/constants'

export interface ChatMessageProps extends ChatMessageActionsProps {
  isLoading?: boolean
}

const ChatAvatar = ({
  role,
  className,
  ...props
}: { role: Message['role'] } & React.HTMLAttributes<HTMLDivElement>) => {
  const classNames = cn(
    'h-6 w-6 shrink-0 select-none rounded border p-0.5 shadow lg:h-8 lg:w-8 lg:p-1',
    role.includes('user') ? 'bg-background' : 'bg-theme-gradient',
    className
  )
  return role === Role.User ? (
    <UserAvatar className={classNames} {...props} />
  ) : (
    <RobotAvatar className={classNames} {...props} />
  )
}

export function ChatMessage({ isLoading, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'group relative mb-8 flex flex-col items-start md:-ml-6 lg:-ml-12'
      )}
    >
      <div className="flex w-full items-center px-1 lg:px-0">
        <ChatAvatar role={props.role} className="block md:hidden" />
        <ChatMessageActions
          className="mr-2 flex-1 group-hover:opacity-100 md:opacity-0"
          {...props}
        />
        <Timestamp full date={props.createdAt} className="text-primary/50" />
      </div>
      <div className="flex w-full">
        <ChatAvatar role={props.role} className="hidden md:block" />
        <div className="flex-1 space-y-2 overflow-hidden px-1 lg:ml-4">
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
