'use client'

import { type Message } from 'ai'

import { Button } from '@/components/ui/button'
import {
  IconCheck,
  IconCopy,
  IconRefresh,
  IconTrash
} from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { Role } from '@/lib/constants'

type MessageComponentProps = React.ComponentProps<'div'> & Message

export interface ChatMessageActionsProps
  extends Omit<MessageComponentProps, 'id'> {
  id?: string
  onDelete?: (id: string) => void
  onReload?: (id: string) => void
}

export function ChatMessageActions({
  id,
  content,
  className,
  onDelete,
  onReload,
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
        'flex items-center justify-end transition-opacity md:-right-10 md:-top-2',
        className
      )}
    >
      {id && props.role === Role.User && onReload && (
        <Button variant="ghost" size="icon" onClick={() => onReload(id)}>
          <IconRefresh />
          <span className="sr-only">Reload the message</span>
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
      {id && onDelete && (
        <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
          <IconTrash />
          <span className="sr-only">Delete the message</span>
        </Button>
      )}
    </div>
  )
}
