'use client'

import { cn } from '@/lib/utils'
import { RobotAvatar } from './ui/avatar'
import { useChatStore } from '@/lib/store/chat'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface ChatHeaderItemProps {
  className?: string
}

export function ChatHeader({ className }: ChatHeaderItemProps) {
  const chat = useChatStore()

  if (!chat?.id) return null

  return (
    <div
      className={cn(
        'group relative flex h-16 w-full items-center bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 py-1 backdrop-blur-xl',
        className
      )}
    >
      <Button variant="ghost" className="mr-2 h-14 w-14">
        <RobotAvatar className="text-4xl" />
      </Button>

      <div className="flex w-full flex-1 flex-col justify-between pr-16">
        <h2
          className="relative flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          <span className="whitespace-nowrap text-lg">
            {chat.title ?? 'AI Assistant'}
          </span>
        </h2>
        <div className="">
          <Badge variant="secondary">{chat.model}</Badge>
        </div>
      </div>
    </div>
  )
}
