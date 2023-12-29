'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

import { type Chat } from '@/types/database'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  FavoriteAction,
  FavoriteActionProps
} from '@/components/favorite-action'
import { IconMessageaText } from '@/components/ui/icons'

interface ChatItemProps {
  chat: Chat
  favorite?: FavoriteActionProps['favorite']
  children?: React.ReactNode
}

const Timestamp = dynamic(() => import('@/components/ui/timestamp'), {
  ssr: false
})

export function ChatItem({ chat, children, favorite }: ChatItemProps) {
  const { id } = useParams()
  const isActive = id ? id === chat.id : !chat.isSaved

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
        <div className="flex w-full min-w-full flex-col">
          <h4
            className="relative flex w-full flex-1 select-none items-center justify-between break-all"
            title={chat.title}
          >
            {chat.isSaved ? (
              <FavoriteAction
                id={chat.id}
                isFavorite={chat.isFavourite}
                favorite={favorite}
              />
            ) : (
              <div className="mr-1 flex h-6 w-6 items-center justify-center">
                <IconMessageaText />
              </div>
            )}
            <span className="flex-1 truncate text-lg">{chat.title}</span>
            {isActive || (
              <Timestamp
                date={chat.lastMessageAt ?? chat.createdAt}
                className="w-10 text-right text-primary/50 group-hover:opacity-0"
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
