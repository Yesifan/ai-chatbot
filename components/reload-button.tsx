'use client'

import { useTransition } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconSync } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export function ButtonReload({
  isLoading,
  onClick,
  children,
  ...props
}: { isLoading?: boolean } & ButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick: React.MouseEventHandler<
    HTMLButtonElement
  > = async event => {
    event.preventDefault()
    startTransition(async () => onClick?.(event))
  }

  return (
    <Button
      variant="board"
      size="icon"
      disabled={isLoading || isPending}
      onClick={handleClick}
      {...props}
    >
      <IconSync
        className={cn(
          isLoading || isPending ? ' animate-spin' : '',
          children ? 'mr-1' : ''
        )}
      />
      {children ?? <span className="sr-only">Reload the chat</span>}
    </Button>
  )
}
