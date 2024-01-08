'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { cn } from '@/lib/utils'
import { getRobots, removeRobot } from '@/app/actions/robot'
import { Button } from '@/components/ui/button'
import { RemoveActions } from '@/components/remove-actions'
import { RobotItem, RobotWithLastMessage } from './robot-item'
import type { Robot } from '@/types/database'
import { useSessionStatusEffect } from '@/lib/hooks/use-login'

interface RobotListProps {
  initalRobots?: RobotWithLastMessage[]
  className?: string
}

const removeDesc =
  'This will permanently delete this Roobt and associated Chat record and remove your data from our servers. And Favorite chat records will be moved to the inbox.'

export function RobotList({ initalRobots, className }: RobotListProps) {
  const [error, setError] = useState<string>()
  const [isLoading, startTransition] = useTransition()
  const [robots, setRobots] = useState<Robot[]>(initalRobots ?? [])

  const removeRobotHandler = async (id: string) => {
    const result = await removeRobot(id)
    if (typeof result === 'bigint') {
      setRobots(chats => chats.filter(chat => chat.id !== id))
    }
    return result
  }

  const reloadRobots = async () => {
    startTransition(async () => {
      const robots = await getRobots()
      if ('error' in robots) {
        setError(robots.error)
      } else {
        setRobots(robots)
      }
    })
  }

  const status = useSessionStatusEffect(() => {
    if (status === 'authenticated') {
      reloadRobots()
    } else {
      setRobots([])
    }
  })

  if (status !== 'authenticated' || error) {
    return (
      <div className={cn('flex flex-1 flex-col', className)}>
        <Button className="mx-2" variant="outline" asChild>
          <Link href="/robot"> Discover Robot 🤖</Link>
        </Button>
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
      <Button className="mx-2" variant="outline" isLoading={isLoading} asChild>
        <Link href="/robot">New Robot 🤖</Link>
      </Button>
      <div className="flex-1 space-y-2 overflow-auto px-2 pt-2">
        {robots.map(robot => (
          <RobotItem key={robot?.id} robot={robot}>
            <RemoveActions
              id={robot.id}
              desc={removeDesc}
              remove={removeRobotHandler}
            />
          </RobotItem>
        ))}
      </div>
    </div>
  )
}
