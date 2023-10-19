import * as React from 'react'

import { clearChats } from '@/app/actions'
import { HistoryChatList } from '@/components/history-chat-list'

import { ThemeToggle } from '@/components/theme-toggle'
import { ClearHistory } from '@/components/clear-history'
import { cn } from '@/lib/utils'

// TODO:Display different contents according to whether user log in or not.
export async function Sidebar() {
  return (
    <section className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
      <HistoryChatList />
      <div className={cn('flex items-center justify-between p-4')}>
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} />
      </div>
    </section>
  )
}
