'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'

import { cn } from '@/lib/utils'
import { getRobots, removeRobot } from '@/app/actions/robot'
import { Button } from '@/components/ui/button'
import { RemoveActions } from '@/components/remove-actions'
import { RobotItem } from './robot-item'
import type { Robot } from '@/types/database'
import Link from 'next/link'
import BubblesLoading from '@/components/ui/loading'

interface RobotListProps {
  initalRobots?: Robot[]
  className?: string
}

export function RobotList({ initalRobots, className }: RobotListProps) {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string>()
  const [isLoading, startTransition] = useTransition()
  const [robots, setRobots] = useState<Robot[]>(initalRobots ?? [])

  const removeChatHandler = async (id: string) => {
    const result = await removeRobot(id)
    if (typeof result === 'bigint') {
      setRobots(chats => chats.filter(chat => chat.id !== id))
    }
    return result
  }

  const updateChats = async () => {
    startTransition(async () => {
      const robots = await getRobots()
      if ('error' in robots) {
        setError(robots.error)
      } else {
        setRobots(robots)
      }
    })
  }

  useEffect(() => {
    if (status === 'authenticated' && session.user.id) {
      updateChats()
    } else {
      setRobots([])
    }
  }, [status, session?.user.id, robots.length])

  if (status !== 'authenticated' || error) {
    return (
      <div className={cn('flex flex-1 flex-col', className)}>
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {error ?? 'Please login in first'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-1 flex-col', className)}>
      <Button className="mx-2" variant="outline" disabled={isLoading}>
        {isLoading ? (
          <BubblesLoading />
        ) : (
          <Link href="/robot/create">New Robot 🤖</Link>
        )}
      </Button>
      <div className="flex-1 space-y-2 overflow-auto px-2 pt-2">
        {robots.map(robot => (
          <RobotItem key={robot?.id} robot={robot}>
            <RemoveActions id={robot.id} remove={removeChatHandler} />
          </RobotItem>
        ))}
      </div>
    </div>
  )
}
