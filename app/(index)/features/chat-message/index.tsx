// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx
import { cn } from '@/lib/utils'
import { Markdown } from '@/components/markdown'
import { ChatMessageActions, ChatMessageActionsProps } from './actions'
import { RobotAvatar, UserAvatar } from '@/components/ui/avatar'
import BubblesLoading from '@/components/ui/loading'
import Timestamp from '@/components/ui/timestamp'
import { Role, SYSTEM_MESSAGE_COMMAND, SystemMessageKey } from '@/lib/constants'
import React from 'react'
import { ChatMessageLogging } from './system-logging'
import { ChatMessageWarning } from './system-warning'

export interface ChatMessageProps extends ChatMessageActionsProps {
  isLoading?: boolean
}

const ChatAvatar = ({
  role,
  className,
  ...props
}: { role: Role } & React.HTMLAttributes<HTMLDivElement>) => {
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

export function ChatMessageContainer({
  children,
  ...props
}: React.PropsWithChildren & ChatMessageProps) {
  return (
    <div
      className={cn('group relative mb-8 flex flex-col items-start lg:-ml-12')}
    >
      <div className="flex w-full items-center px-1 lg:px-0">
        <ChatAvatar role={props.role} className="block lg:hidden" />
        <ChatMessageActions
          className="mr-2 flex-1 group-hover:opacity-100 md:opacity-0"
          {...props}
        />
        <Timestamp full date={props.createdAt} className="text-primary/50" />
      </div>
      <div className="flex w-full">
        <ChatAvatar role={props.role} className="hidden lg:block" />
        <div className="flex-1 space-y-2 overflow-hidden px-1 lg:ml-4">
          {children}
        </div>
      </div>
    </div>
  )
}

function ChatMessageContent({
  role,
  content
}: Pick<ChatMessageProps, 'role' | 'content'>) {
  if ((role = Role.System)) {
    const [command, key, ...body] = content.split(':')
    if (command === SYSTEM_MESSAGE_COMMAND) {
      if (key === SystemMessageKey.Logging) {
        return <ChatMessageLogging />
      } else {
        return <ChatMessageWarning content={body.join('\n')} />
      }
    }
  }
  return <Markdown content={content} />
}
export function ChatMessage({ isLoading, ...props }: ChatMessageProps) {
  return (
    <ChatMessageContainer {...props}>
      {props.content ? (
        <ChatMessageContent role={props.role} content={props.content} />
      ) : isLoading ? (
        <BubblesLoading />
      ) : null}
    </ChatMessageContainer>
  )
}
