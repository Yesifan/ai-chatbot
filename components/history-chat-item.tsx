'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { type Chat } from '@/types/chat'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { RobotAvatar } from './ui/avatar'

interface ChatItemProps {
  chat: Chat
  children: React.ReactNode
}

export function ChatItem({ chat, children }: ChatItemProps) {
  const { id } = useParams()
  const isActive = id === chat.id

  if (!chat?.id) return null

  return (
    <div
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'w-ful group relative flex h-auto overflow-hidden px-2',
        isActive && 'bg-accent'
      )}
    >
      <Link href={`/chat/${chat.id}`} className="flex w-full items-center">
        <RobotAvatar className="mr-2 h-14 w-14 shrink-0 text-4xl" />
        <div className="flex w-full flex-col pr-16">
          <h4
            className="relative flex-1 select-none overflow-hidden text-ellipsis break-all"
            title={chat.title}
          >
            <span className="whitespace-nowrap text-lg">{chat.title}</span>
          </h4>
          <div className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all">
            <span className="whitespace-nowrap text-xs text-gray-400">
              {chat.title}
            </span>
          </div>
        </div>
      </Link>
      <div
        className={cn(
          'absolute right-2 top-1 opacity-0 group-hover:opacity-100',
          isActive && 'opacity-100'
        )}
      >
        {children}
      </div>
    </div>
  )
}
