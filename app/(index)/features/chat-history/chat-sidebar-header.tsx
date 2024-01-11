'use client'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IconSidebar } from '@/components/ui/icons'
import { useSetAtom } from 'jotai'
import { chatSidebarToogleAtom } from '@/lib/store/global'

export function ChatSidebarHeader({ className }: { className?: string }) {
  const toogleChatSidebar = useSetAtom(chatSidebarToogleAtom)
  return (
    <header
      className={cn(
        'flex h-16 w-full items-center justify-between bg-background px-4',
        className
      )}
    >
      <span>Chat List</span>
      <div className="flex items-center">
        <Button
          variant="highlight"
          className="-ml-2 h-9 w-9 p-0"
          onClick={toogleChatSidebar}
        >
          <IconSidebar className="h-6 w-6" />
          <span className="sr-only">Toggle Chat Sidebar</span>
        </Button>
      </div>
    </header>
  )
}
