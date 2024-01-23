'use client'

import { Button } from '@/components/ui/button'
import {
  IconCheck,
  IconCopy,
  IconRefresh,
  IconStar,
  IconTrash
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { Role } from '@/lib/constants'
import { useDelayStatus } from '@/lib/hooks/use-delay-status'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Message } from '@/types/database'

type MessageComponentProps = React.ComponentProps<'div'> & Message

export interface ChatMessageActionsProps
  extends Omit<MessageComponentProps, 'id'> {
  id?: string
  onDelete?: (id: string) => void
  onReload?: (id: string) => void
  onFavourite?: (id: string) => void
}

export function ChatMessageActions({
  id,
  content,
  className,
  onDelete,
  ...props
}: ChatMessageActionsProps) {
  const [isReload, pickReload] = useDelayStatus({ timeout: 2000 })
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(content)
  }

  const onReload = (id: string) => {
    if (isReload) return
    pickReload()
    props.onReload?.(id)
  }

  const onFavourite = (id: string) => {
    props.onFavourite?.(id)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity md:-right-10 md:-top-2',
        className
      )}
    >
      {id && (
        <Button variant="ghost" size="icon" onClick={() => onFavourite(id)}>
          <IconStar />
          <span className="sr-only">Favourite the message</span>
        </Button>
      )}
      {id && props.role === Role.User && props.onReload && (
        <Button variant="ghost" size="icon" onClick={() => onReload(id)}>
          {isReload ? <IconCheck /> : <IconRefresh />}
          <span className="sr-only">Reload the message</span>
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
      {id && onDelete && (
        // TODO: Secondary confirmation
        <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
          <IconTrash />
          <span className="sr-only">Delete the message</span>
        </Button>
      )}
    </div>
  )
}
