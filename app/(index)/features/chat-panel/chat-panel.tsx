'use client'
import React, { useState } from 'react'

import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store/chat'
import { Token } from '@/components/token-badge'
import { usePrompt } from '@/lib/hooks/use-prompt'
import {
  ATTACHED_MESSAGES_COUNT,
  INFINITE_ATTACHED_MESSAGES_COUNT
} from '@/lib/constants'
import { PromptForm } from './prompt-form'
import { Temperature } from './temperature'
import { SelectModel } from './select-model'
import { PromptSwitch } from './prompt-switch'
import { MessagesCount } from './messages-count'
import type { UseChatHelpers } from '@/types/ai'
import type { Message } from '@/types/database'

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

const AllToken = React.memo(function AllToken({
  input,
  messages
}: {
  input: string
  messages: Message[]
}) {
  const chatStore = useChatStore()
  const content = React.useMemo(() => {
    const historyMessages =
      chatStore.attachedMessagesCount === INFINITE_ATTACHED_MESSAGES_COUNT
        ? messages
        : chatStore.attachedMessagesCount === 0
        ? undefined
        : messages.slice(
            -(chatStore.attachedMessagesCount ?? ATTACHED_MESSAGES_COUNT)
          )
    const historyMessageContent = historyMessages
      ?.map(item => item.content)
      .join(';')
    console.log(
      (chatStore.pinPrompt ?? '') + input + (historyMessageContent ?? '')
    )
    return (chatStore.pinPrompt ?? '') + input + (historyMessageContent ?? '')
  }, [chatStore.attachedMessagesCount, chatStore.pinPrompt, input, messages])
  return <Token variant="secondary" className="h-6" input={content} />
})

export function ChatPanel({
  id,
  input,
  messages,
  height = 240,
  isLoading,
  setInput,
  className,
  ...props
}: ChatPanelProps) {
  const chatStore = useChatStore()
  const [prompt, setPrompt] = useState(chatStore.pinPrompt ?? '')
  const { getPrompt, setPinPrompt, isPrompt, setIsPrompt, isPromptLoading } =
    usePrompt()
  const placeholder = isPrompt
    ? 'Please enter role prompt. Define a custom ai assistant.'
    : 'Send a message.'

  const chat = async (value: string) => {
    const pinPrompt = getPrompt()
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
          <AllToken messages={messages} input={input} />
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
