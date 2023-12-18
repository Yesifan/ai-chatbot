'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconSync } from '@/components/ui/icons'

export function ButtonReload({
  className,
  isLoading,
  onClick,
  ...props
}: { isLoading?: boolean } & ButtonProps) {
  const [isPending, startTransition] = useTransition()
  console.log('isPending', isPending)
  const handleClick: React.MouseEventHandler<
    HTMLButtonElement
  > = async event => {
    console.log('handleClick', isPending)
    event.preventDefault()
    startTransition(async () => onClick?.(event))
  }

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isLoading || isPending}
      className={cn('bg-background', className)}
      onClick={handleClick}
      {...props}
    >
      <IconSync className={isLoading || isPending ? ' animate-spin' : ''} />
      <span className="sr-only">Reload the chat</span>
    </Button>
  )
}
