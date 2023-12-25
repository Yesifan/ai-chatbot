'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import { cn } from '@/lib/utils'
import { getRobots, removeRobot } from '@/app/actions/robot'
import { Button } from '@/components/ui/button'
import { ChatItemActions } from '@/components/history-chat-actions'
import { RobotItem } from './robot-item'
import type { Robot } from '@/types/database'
import Link from 'next/link'

interface RobotListProps {
  initalRobots?: Robot[]
  className?: string
}

export function RobotList({ initalRobots, className }: RobotListProps) {
  const { data: session, status } = useSession()
  const [isLoading, setLoading] = useState(false)
  const [robots, setRobots] = useState<Robot[]>(initalRobots ?? [])

  const updateChats = async () => {
    setLoading(true)
    const robot = await getRobots()
    if ('error' in robot) {
      console.error(robot.error)
    } else {
      setRobots(robot)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session.user.id) {
      updateChats()
    } else {
      setRobots([])
    }
  }, [status, session?.user.id])

  const removeChatHandler = async (id: string) => {
    const result = await removeRobot(id)
    if (typeof result === 'bigint') {
      setRobots(chats => chats.filter(chat => chat.id !== id))
    }
    return result
  }

  if (status !== 'authenticated') {
    return (
      <div className={cn('flex flex-1 flex-col', className)}>
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Please login in first</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-1 flex-col', className)}>
      <Button className="mx-2" variant="outline" asChild>
        <Link href="/robot/create">New Robot 🤖</Link>
      </Button>
      <div className="flex-1 space-y-2 overflow-auto px-2 pt-2">
        {robots.map(robot => (
          <RobotItem key={robot?.id} robot={robot}>
            <ChatItemActions id={robot.id} removeChat={removeChatHandler} />
          </RobotItem>
        ))}
      </div>
    </div>
  )
}
