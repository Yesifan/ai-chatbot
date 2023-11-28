import * as React from 'react'
import { type Metadata } from 'next'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

import { cn } from '@/lib/utils'
import { clearChats, getChats } from '@/app/actions'
import { Header } from '@/components/header'
import { ClearHistory } from '@/components/clear-history'
import { InboxChatItem } from '@/components/inbox-chat-item'
import { HistoryChatList } from '@/components/history-chat-list'

export const runtime = 'edge'
export const preferredRegion = 'home'

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth()

  if (!session?.user) {
    redirect(`/?next=/history`)
  }

  return {
    title: 'History Chat'
  }
}

const ThemeToggle = dynamic(() => import('@/components/theme-toggle'), {
  ssr: false
})

export default async function ChatHistoryPage({
  className
}: {
  className?: string
}) {
  const chats = await getChats()

  return (
    <section className={cn('flex h-full flex-col p-0', className)}>
      <Header />
      <InboxChatItem className="m-2 shrink-0" />
      <HistoryChatList initalChats={chats} />
      <div className={cn('flex items-center justify-between p-4')}>
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} />
      </div>
    </section>
  )
}
