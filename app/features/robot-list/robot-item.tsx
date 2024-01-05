'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { type Robot } from '@/types/database'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { RobotAvatar } from '@/components/ui/avatar'

interface RobotItemProps {
  robot: Robot
  children?: React.ReactNode
}

// const Timestamp = dynamic(() => import('@/components/ui/timestamp'), {
//   ssr: false
// })

export function RobotItem({ robot, children }: RobotItemProps) {
  const { id } = useParams()
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
        <RobotAvatar className="mr-1 h-14 w-14 shrink-0 p-2 text-4xl" />
        <div className="flex w-full min-w-full flex-col pr-14">
          <h4
            className="relative flex w-full flex-1 select-none items-center justify-between break-all"
            title={robot.name}
          >
            <span className="w-40 truncate text-lg">{robot.name}</span>
            {/* {isActive || (
              <Timestamp
                date={robot.lastMessageAt ?? robot.createdAt}
                className="text-primary/50 group-hover:opacity-0"
              />
            )} */}
          </h4>
          <div className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all">
            <span className="whitespace-nowrap text-xs text-primary/50">
              {robot.pinPrompt}
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
