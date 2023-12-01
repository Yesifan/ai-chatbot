import Link from 'next/link'

import { cn } from '@/lib/utils'
import { InboxAvatar } from './ui/avatar'
import { buttonVariants } from './ui/button'
import { INBOX_CHAT } from '@/lib/constants'

interface ChatItemProps {
  className?: string
}

export function InboxChatItem({ className }: ChatItemProps) {
  return (
    <div
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'w-ful group relative flex h-auto overflow-hidden bg-muted/50 px-2 py-0',
        className
      )}
    >
      <Link href="/" className="flex w-full items-center">
        <InboxAvatar className="h-14 w-14 shrink-0 text-4xl" />
        <div className="flex w-full min-w-full flex-col pr-14">
          <h4
            className="relative flex w-full flex-1 select-none items-center justify-between break-all text-center"
            title="Small Talk"
          >
            <span className="w-40 truncate text-lg">{INBOX_CHAT}</span>
          </h4>
        </div>
      </Link>
    </div>
  )
}
