import * as React from 'react'
import dynamic from 'next/dynamic'

import { clearChats } from '@/app/actions'
import { HistoryChatList } from '@/components/history-chat-list'

import { ClearHistory } from '@/components/clear-history'
import { cn } from '@/lib/utils'
import { Header } from './header'

const ThemeToggle = dynamic(() => import('@/components/theme-toggle'), {
  ssr: false
})

// TODO:Display different contents according to whether user log in or not.
export async function Sidebar() {
  return (
    <section className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
      <Header />
      <HistoryChatList />
      <div className={cn('flex items-center justify-between p-4')}>
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} />
      </div>
    </section>
  )
}
