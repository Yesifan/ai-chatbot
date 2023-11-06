'use client'

import { type Message } from 'ai'

import { Button } from '@/components/ui/button'
import { IconCheck, IconCopy, IconTrash } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'

type MessageComponentProps = React.ComponentProps<'div'> & Message

export interface ChatMessageActionsProps extends MessageComponentProps {
  onDelete?: (id: string) => void
}

export function ChatMessageActions({
  id,
  content,
  className,
  onDelete,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(content)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete?.(id)}>
        <IconTrash />
        <span className="sr-only">Delete the message</span>
      </Button>
    </div>
  )
}
