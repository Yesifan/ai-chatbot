import * as React from 'react'
import dynamic from 'next/dynamic'

import { cn } from '@/lib/utils'
import { Header } from '@/components/header'
import { InboxChatItem } from '@/components/inbox-chat-item'
import { RobotList } from './robot-list/robot-list'
import { getRobots } from '../actions/robot'

const ThemeToggle = dynamic(() => import('@/components/theme-toggle'), {
  ssr: false
})

export async function Siderbar({ className }: { className?: string }) {
  const robots = await getRobots()
  const initalRobots = 'error' in robots ? [] : robots

  return (
    <section
      className={cn('flex h-screen flex-col bg-background p-0', className)}
    >
      <Header />
      <InboxChatItem className="m-2 shrink-0" />
      <RobotList initalRobots={initalRobots} />
      <div className={cn('flex items-center p-4')}>
        <ThemeToggle />
      </div>
    </section>
  )
}
