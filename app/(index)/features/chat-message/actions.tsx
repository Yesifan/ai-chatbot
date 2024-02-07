'use client'

import { Button } from '@/components/ui/button'
import {
  IconCheck,
  IconCopy,
  IconRefresh,
  IconTrash
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { Role } from '@/lib/constants'
import { useDelayStatus } from '@/lib/hooks/use-delay-status'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Message } from '@/types/database'
import { FavoriteButton } from '@/components/favorite-action'
import { UseChatHelpers } from '@/types/ai'
import toast from 'react-hot-toast'

type MessageComponentProps = React.ComponentProps<'div'> &
  Message &
  Partial<Pick<UseChatHelpers, 'favor' | 'reload' | 'remove'>>

export interface ChatMessageActionsProps
  extends Omit<MessageComponentProps, 'id'> {
  id?: string
}

export function ChatMessageActions({
  id,
  content,
  className,
  ...props
}: ChatMessageActionsProps) {
  const [isReload, pickReload] = useDelayStatus({ timeout: 2000 })
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(content)
  }

  const reload = () => {
    if (!id) return
    if (isReload) return
    pickReload()
    props.reload?.(id)
  }

  const remove = async () => {
    if (!id) return
    const res = await props.remove?.(id)
    if (res) {
      toast.success('Message removed.')
    } else {
      toast.error('Message remove failed.')
    }
  }

  const favor = async (id: string) => {
    return await props.favor?.(id, !props.isFavourite)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity md:-right-10 md:-top-2',
        className
      )}
    >
      {id && (
        <FavoriteButton
          id={id}
          desc="Favorite The Message"
          isFavorite={props.isFavourite}
          favorite={favor}
        />
      )}
      {id && props.role === Role.User && (
        <Button variant="ghost" size="icon" onClick={reload}>
          {isReload ? <IconCheck /> : <IconRefresh />}
          <span className="sr-only">Reload the message</span>
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
      {id && props.remove && (
        // TODO: Secondary confirmation
        <Button variant="ghost" size="icon" onClick={remove}>
          <IconTrash />
          <span className="sr-only">Delete the message</span>
        </Button>
      )}
    </div>
  )
}
