'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { useAtBottom } from '@/lib/hooks/use-scroll'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconArrowDown } from '@/components/ui/icons'

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom(15)

  const scrollToBottom = React.useCallback(
    () =>
      window.scrollTo({
        top: document.body.offsetHeight,
        behavior: 'smooth'
      }),
    []
  )

  React.useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  return (
    <Button
      variant="board"
      size="icon"
      className={cn(
        'transition-opacity duration-300',
        isAtBottom ? 'opacity-0' : 'opacity-100',
        className
      )}
      onClick={scrollToBottom}
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  )
}
