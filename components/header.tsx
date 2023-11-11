import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { IconGitHub, IconSeparator, IconSidebar } from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'

const GITHUB_REPO = 'https://github.com/Yesifan/ai-chatbot'

const TopLeftGroup = () => (
  <div className="flex items-center">
    <Button variant="ghost" className="-ml-2 h-9 w-9 p-0">
      <IconSidebar className="h-6 w-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
    <div className="flex items-center">
      <IconSeparator className="h-6 w-6 text-muted-foreground/50" />
      <UserMenu />
    </div>
  </div>
)

export async function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'z-50 flex h-16 w-full shrink-0 items-center justify-between bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4',
        className
      )}
    >
      <TopLeftGroup />
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href={GITHUB_REPO}
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
        </a>
      </div>
    </header>
  )
}
