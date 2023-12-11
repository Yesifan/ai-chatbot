'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { useScroll } from '@/lib/hooks/use-scroll'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconArrowDown } from '@/components/ui/icons'

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const { fromBottm, scrollToBottom } = useScroll()
  const isAtBottom = fromBottm < 10

  React.useEffect(() => {
    scrollToBottom?.(10, 'smooth')
  }, [scrollToBottom])

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'z-20 bg-background transition-opacity duration-300',
        isAtBottom ? 'opacity-0' : 'opacity-100',
        className
      )}
      onClick={() => scrollToBottom?.(10, 'smooth')}
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  )
}
