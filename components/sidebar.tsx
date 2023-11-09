import * as React from 'react'
import dynamic from 'next/dynamic'

import { clearChats, getChats } from '@/app/actions'
import { HistoryChatList } from '@/components/history-chat-list'

import { ClearHistory } from '@/components/clear-history'
import { cn } from '@/lib/utils'
import { Header } from './header'

const ThemeToggle = dynamic(() => import('@/components/theme-toggle'), {
  ssr: false
})

export async function Sidebar() {
  const chats = await getChats()
  return (
    <section className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
      <Header />
      <HistoryChatList initalChats={chats} />
      <div className={cn('flex items-center justify-between p-4')}>
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} />
      </div>
    </section>
  )
}
