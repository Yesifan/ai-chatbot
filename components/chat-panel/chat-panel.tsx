'use client'

import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store/chat'
import { PromptForm } from './prompt-form'
import { Temperature } from './temperature'
import { SelectModel } from './select-model'
import { MessagesCount } from './messages-count'

import type { UseChatHelpers } from '@/types/ai'

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'reload'
    | 'messages'
    | 'stop'
    | 'input'
    | 'setInput'
    | 'setMessages'
    | 'setLoading'
  > {
  id?: string
  className?: string
}

const placeholder = 'Send a message.'

export function ChatPanel({
  id,
  setLoading,
  className,
  ...props
}: ChatPanelProps) {
  const chatStore = useChatStore()

  const chat = async (value: string) => {
    await props.append(value, chatStore.attachedMessagesCount)
  }

  return (
    <div className={cn('bg-background pt-2 shadow-lg', className)}>
      <div className="flex space-x-6 px-4 pb-2">
        <SelectModel className="h-6 w-6" />
        <MessagesCount className="h-6 w-6" />
        <Temperature className="h-6 w-6" />
      </div>
      <PromptForm onSubmit={chat} placeholder={placeholder} {...props} />
    </div>
  )
}
