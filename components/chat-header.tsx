'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { updateChat } from '@/app/actions'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store/chat'
import { platform, Platform } from '@/lib/utils/responsive.clint'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { IconHisotry } from './ui/icons'
import { Input, InputProps } from './ui/input'
import { InboxAvatar, RobotAvatar } from './ui/avatar'

interface ChatHeaderItemProps {
  className?: string
}

const DEFAULT_TITLE = 'AI Assistant'

const TitleInput = ({
  className,
  disabled
}: Pick<InputProps, 'className' | 'disabled'>) => {
  const chat = useChatStore()
  const titleRef = useRef(chat.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isEdit, setEdit] = useState(false)

  const { submitRef, cancelRef, onKeyDown } = useEnterSubmit()

  useEffect(() => {
    if (isEdit) {
      inputRef.current?.focus()
    }
  }, [isEdit])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    chat.setTitle?.(value)
  }

  const onSubmit = () => {
    if (chat.id) {
      setEdit(false)
      updateChat(chat.id, { title: chat.title })
    }
  }

  const onCancel = () => {
    setEdit(false)
    chat.setTitle?.(titleRef.current ?? DEFAULT_TITLE)
  }

  return isEdit ? (
    <div className="flex h-7 w-full space-x-2">
      <Input
        ref={inputRef}
        value={chat.title}
        onChange={onChange}
        className={cn('h-7', className)}
        onKeyDown={onKeyDown}
      />
      <Button ref={submitRef} className="h-7 shrink-0" onClick={onSubmit}>
        Ok
      </Button>
      <Button
        ref={cancelRef}
        variant="secondary"
        className="h-7 shrink-0"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  ) : (
    <span
      className="whitespace-nowrap text-lg"
      onClick={() => chat.id && !disabled && setEdit(true)}
    >
      <h2
        className="relative flex-1 select-none overflow-hidden text-ellipsis break-all"
        title={chat.title}
      >
        {chat.title ?? DEFAULT_TITLE}
      </h2>
    </span>
  )
}

export function ChatHeader({ className }: ChatHeaderItemProps) {
  const chat = useChatStore()
  const pathname = usePathname()
  const isInbox = pathname === '/'

  return (
    <div
      className={cn(
        'group relative flex h-16 w-full items-center bg-background px-4 py-1 backdrop-blur-xl',
        className
      )}
    >
      {isInbox ? (
        <InboxAvatar className="mx-2 mr-4 w-10 text-4xl" />
      ) : (
        <Button variant="ghost" className="mr-2 h-14 px-2">
          <RobotAvatar className="w-10 text-4xl" />
        </Button>
      )}
      <div className="flex w-full flex-1 flex-col justify-between pr-6">
        <TitleInput disabled={isInbox} />
        <div className="">
          <Badge variant="secondary">{chat.model}</Badge>
        </div>
      </div>
      <div className="ml-auto">
        {platform === Platform.Mobile ? (
          <Button variant="ghost" className="h-8 w-8 px-1" asChild>
            <Link href="/history">
              <IconHisotry className="h-6 w-6" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
