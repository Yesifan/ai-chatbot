'use client'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store/chat'
import { Badge } from './ui/badge'
import { Input, InputProps } from './ui/input'
import { Button } from './ui/button'
import { RobotAvatar } from './ui/avatar'
import { updateChat } from '@/app/actions'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

interface ChatHeaderItemProps {
  className?: string
}

const DEFAULT_TITLE = 'AI Assistant'

const TitleInput = ({ className }: Pick<InputProps, 'className'>) => {
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
    setEdit(false)
    updateChat(chat.id, { title: chat.title })
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
    <span className="whitespace-nowrap text-lg" onClick={() => setEdit(true)}>
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [isEdit, setEdit] = useState(false)

  useEffect(() => {
    if (isEdit) {
      inputRef.current?.focus()
    }
  }, [isEdit])

  if (!chat?.id) return null

  return (
    <div
      className={cn(
        'group relative flex h-16 w-full items-center bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 py-1 backdrop-blur-xl',
        className
      )}
    >
      <Button variant="ghost" className="mr-2 h-14 w-14">
        <RobotAvatar className="text-4xl" />
      </Button>
      <div className="flex w-full flex-1 flex-col justify-between pr-6">
        <TitleInput />
        <div className="">
          <Badge variant="secondary">{chat.model}</Badge>
        </div>
      </div>
    </div>
  )
}
