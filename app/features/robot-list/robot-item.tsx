'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Avatar, { RobotAvatar } from '@/components/ui/avatar'
import { Chat, Robot } from '@/types/database'

export type RobotWithLastMessage = Robot &
  Partial<Pick<Chat, 'lastMessage' | 'lastMessageAt'>>

interface RobotItemProps {
  robot: RobotWithLastMessage
  children?: React.ReactNode
}

const Timestamp = dynamic(() => import('@/components/ui/timestamp'), {
  ssr: false
})

export function RobotItem({ robot, children }: RobotItemProps) {
  const { chat } = useParams()
  const id = chat?.[0]

  const isActive = id === robot.id

  if (!robot?.id) return null

  return (
    <div
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'w-ful group relative flex h-auto overflow-hidden px-2',
        isActive && 'bg-muted/50'
      )}
    >
      <Link href={`/chat/${robot.id}`} className="flex w-full items-center">
        <Avatar
          className="mr-1 h-14 w-14 shrink-0 rounded p-2 text-4xl"
          fallback={robot.icon?.startsWith('http') ? '🤖' : robot.icon ?? '🤖'}
          src={robot.icon?.startsWith('http') ? robot.icon : undefined}
        />
        <div className="flex w-full min-w-full flex-col pr-14">
          <h4
            className="relative flex w-full flex-1 select-none items-center justify-between break-all"
            title={robot.name}
          >
            <span className="w-40 truncate text-lg">{robot.name}</span>
            {isActive || (
              <Timestamp
                date={robot.lastMessageAt ?? robot.createdAt}
                className="text-primary/50 group-hover:opacity-0"
              />
            )}
          </h4>
          <div className="relative max-h-5 flex-1 select-none truncate text-xs text-primary/50">
            {robot.lastMessage ?? robot.description}
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
