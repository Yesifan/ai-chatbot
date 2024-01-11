'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { updateChat } from '@/app/actions/chat'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store/chat'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconHisotry, IconMessages } from '@/components/ui/icons'
import { Input, InputProps } from '@/components/ui/input'
import Avatar, { InboxAvatar } from '@/components/ui/avatar'
import { SafeArea } from '@/components/ui/safe-area'
import { Robot } from '@/types/database'
import { DEFAULT_CHAT_NAME, JARVIS } from '@/lib/constants'
import { useAtom } from 'jotai'
import { chatSidebarToogleAtom } from '@/lib/store/global'

interface ChatHeaderItemProps {
  robot?: Robot
  isMobile?: boolean
  className?: string
}

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
    chat.setTitle?.(titleRef.current ?? DEFAULT_CHAT_NAME)
  }

  return isEdit ? (
    <div className="flex h-7 w-full items-center space-x-2">
      <Input
        ref={inputRef}
        value={chat.title}
        onChange={onChange}
        className={cn('h-7', className)}
        onKeyDown={onKeyDown}
      />
      <Button
        ref={submitRef}
        className="h-6 px-2 text-sm md:text-base"
        onClick={onSubmit}
      >
        Ok
      </Button>
      <Button
        ref={cancelRef}
        variant="secondary"
        className="h-6 px-2 text-sm md:text-base"
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
        {chat.title ?? DEFAULT_CHAT_NAME}
      </h2>
    </span>
  )
}

export function ChatHeader({
  robot,
  isMobile,
  className
}: ChatHeaderItemProps) {
  const chat = useChatStore()
  const [isChatSidebar, tooglyChatSidebar] = useAtom(chatSidebarToogleAtom)

  return (
    <header
      className={cn(
        'group relative bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl',
        className
      )}
    >
      <SafeArea className="bg-transparent" />
      <div className="flex h-16 w-full items-center px-4 py-1">
        {robot ? (
          <Button variant="ghost" className="mr-2 h-14 px-2">
            <Avatar
              className="h-10 w-10 text-4xl"
              fallback={
                robot.icon?.startsWith('http') ? '🤖' : robot.icon ?? '🤖'
              }
              src={robot.icon?.startsWith('http') ? robot.icon : undefined}
            />
          </Button>
        ) : (
          <InboxAvatar className="mx-2 mr-4 w-10 text-4xl" />
        )}
        <div className="flex w-full flex-1 flex-col justify-between pr-1">
          <div className="flex text-lg">
            {!isMobile && (
              <>
                <span className="shrink-0">{robot ? robot.name : JARVIS}</span>
                <span className="px-2">-</span>
              </>
            )}
            <TitleInput disabled={!chat.isSaved} />
          </div>
          <div className="">
            <Badge variant="secondary">{chat.model}</Badge>
          </div>
        </div>
        <div className="ml-auto space-x-1">
          {isMobile && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/history">
                <IconHisotry />
              </Link>
            </Button>
          )}
          <Button
            variant={isChatSidebar ? 'highlight' : 'ghost'}
            size="icon"
            onClick={tooglyChatSidebar}
          >
            <IconMessages />
          </Button>
        </div>
      </div>
    </header>
  )
}
