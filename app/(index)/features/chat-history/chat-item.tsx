'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

import { type Chat } from '@/types/database'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { FavoriteAction } from '@/components/favorite-action'

interface ChatItemProps {
  chat: Chat
  children?: React.ReactNode
}

const Timestamp = dynamic(() => import('@/components/ui/timestamp'), {
  ssr: false
})

export function ChatItem({ chat, children }: ChatItemProps) {
  const { id } = useParams()
  const isActive = id === chat.id

  const favorite = async (id: string) => {
    return { ok: false, error: '' }
  }

  if (!chat?.id) return null

  return (
    <div
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'w-ful group relative flex h-auto overflow-hidden px-2',
        isActive && 'bg-muted/50'
      )}
    >
      <Link href={`/chat/${chat.id}`} className="flex w-full items-center">
        <div className="flex w-full min-w-full flex-col pr-14">
          <h4
            className="relative flex w-full flex-1 select-none items-center justify-between break-all"
            title={chat.title}
          >
            <FavoriteAction
              id={chat.id}
              isFavorite={true}
              favorite={favorite}
            />
            <span className="w-40 truncate text-lg">{chat.title}</span>
            {isActive || (
              <Timestamp
                date={chat.lastMessageAt ?? chat.createdAt}
                className="text-primary/50 group-hover:opacity-0"
              />
            )}
          </h4>
          <div className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all">
            <span className="whitespace-nowrap text-xs text-primary/50">
              {chat.lastMessage ?? chat.title}
            </span>
          </div>
        </div>
      </Link>
      {children && (
        <div
          className={cn(
            'absolute right-2 top-1 opacity-0 group-hover:opacity-100',
            isActive && 'opacity-100'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
