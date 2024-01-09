'use client'
import { useState } from 'react'

import { cn, nanoid } from '@/lib/utils'
import { useChatStore } from '@/lib/store/chat'
import { PromptForm } from './prompt-form'
import { Temperature } from './temperature'
import { SelectModel } from './select-model'
import { PromptSwitch } from './prompt-switch'
import { MessagesCount } from './messages-count'

import { Role } from '@/lib/constants'
import { useIsInbox } from '@/lib/hooks/use-inbox'
import { usePrompt } from '@/lib/hooks/use-prompt'
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
  height?: number
  className?: string
  noPause?: boolean
}

export function ChatPanel({
  id,
  input,
  height = 240,
  isLoading,
  setInput,
  className,
  ...props
}: ChatPanelProps) {
  const chatStore = useChatStore()
  const [prompt, setPrompt] = useState(chatStore.pinPrompt ?? '')
  const { setPinPrompt, isPrompt, setIsPrompt, isPromptLoading } = usePrompt()
  const placeholder = isPrompt
    ? 'Please enter role prompt. Define a custom ai assistant.'
    : 'Send a message.'

  const chat = async (value: string) => {
    const pinPrompt = chatStore.pinPrompt
      ? {
          id: nanoid(),
          role: Role.System,
          content: chatStore.pinPrompt
        }
      : null
    await props.append(
      value,
      chatStore.attachedMessagesCount,
      pinPrompt ? [pinPrompt] : undefined
    )
  }

  const submit = async (value: string) => {
    if (isPrompt) {
      setPinPrompt(value)
    } else {
      chat(value)
    }
  }

  return (
    <div className={cn('flex flex-col shadow-lg', className)}>
      <div className={'flex h-10 items-center px-4'}>
        <div
          className={cn(
            'flex space-x-4 transition-transform',
            isPrompt ? 'translate-x-[-150%]' : 'translate-x-0'
          )}
        >
          <SelectModel className="h-6 w-6" />
          <MessagesCount className="h-6 w-6" />
          <Temperature className="h-6 w-6" />
        </div>
        <PromptSwitch
          className="ml-auto"
          checked={isPrompt}
          onCheckedChange={setIsPrompt}
          disabled={!chatStore.isSaved}
        />
      </div>
      <PromptForm
        height={height - 40}
        onSubmit={submit}
        input={isPrompt ? prompt : input}
        setInput={isPrompt ? setPrompt : setInput}
        placeholder={placeholder}
        isLoading={isLoading || isPromptLoading}
        isClearAfterSubmit={!isPrompt}
        {...props}
      />
    </div>
  )
}
