'use client'

import toast from 'react-hot-toast'

import { cn, nanoid } from '@/lib/utils'
import { useChatStore } from '@/lib/store/chat'
import { PromptForm } from './prompt-form'
import { Temperature } from './temperature'
import { SelectModel } from './select-model'
import { PromptSwitch } from './prompt-switch'
import { MessagesCount } from './messages-count'

import type { UseChatHelpers } from '@/types/ai'
import { useState } from 'react'
import { Role } from '@/lib/constants'
import { useIsInbox } from '@/lib/hooks/use-inbox'
import { updateChat } from '@/app/actions'

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

export function ChatPanel({
  id,
  input,
  isLoading,
  setInput,
  className,
  ...props
}: ChatPanelProps) {
  const isInbox = useIsInbox()
  const chatStore = useChatStore()
  const [isPrompt, setIsPrompt] = useState(false)
  const [isPromptLoading, setPromptLoading] = useState(false)
  const [prompt, setPrompt] = useState(chatStore.pinPrompt ?? '')

  const placeholder = isPrompt
    ? 'Please enter role prompt. Define a custom ai assistant.'
    : 'Send a message.'

  const chat = async (value: string) => {
    if (!chatStore.id) {
      throw new Error('Chat id is undefined')
    }
    if (isPrompt) {
      setPromptLoading(true)
      try {
        await updateChat(chatStore.id, { pinPrompt: value })
        chatStore.setPinPrompt?.(value)
      } catch (e) {
        toast.error('Set prompt failed!')
      }
      setIsPrompt(false)
      setPromptLoading(false)
    } else {
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
  }

  return (
    <div className={cn('bg-background pt-2 shadow-lg', className)}>
      <div className={'flex items-center px-4 pb-2'}>
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
          disabled={isInbox}
        />
      </div>
      <PromptForm
        onSubmit={chat}
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
