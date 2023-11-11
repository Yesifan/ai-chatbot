'use client'

import { signIn, useSession } from 'next-auth/react'

import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { nanoid } from '@/lib/utils'
import { useChatStore } from '@/lib/store/chat'
import { Credential, Role } from '@/lib/constants'
import { SelectModel } from './select-model'
import { MessagesCount } from './messages-count'

import type { UseChatHelpers } from '@/types/ai'
import { Temperature } from './temperature'

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
}

const useLogin = () => {
  const { update } = useSession()

  const login = async (value: string) => {
    try {
      const res = await signIn(Credential.AccessToken, {
        redirect: false,
        token: value
      })
      if (res?.error) {
        return 'Login failed, Wrong access token!'
      } else {
        await update()
        return true
      }
    } catch (error: any) {
      console.error('[LOGININ]', error)
      return error.message || 'Login failed, please try again!'
    }
  }

  return login
}

export function ChatPanel({ id, setLoading, ...props }: ChatPanelProps) {
  const { status } = useSession()
  const chatStore = useChatStore()

  const login = useLogin()

  const placeholder =
    status === 'authenticated'
      ? 'Send a message.'
      : 'Please enter access token here.'

  const chat = async (value: string) => {
    if (status === 'authenticated') {
      await props.append(value, chatStore.attachedMessagesCount)
    } else {
      setLoading(true)
      const result = await login(value)
      setLoading(false)
      if (result !== true) {
        props.setMessages(messages => [
          ...messages,
          {
            id: nanoid(),
            content: result,
            role: Role.System
          }
        ])
      }
    }
  }

  return (
    <div className="mt-auto bg-background pt-2 shadow-lg">
      <ButtonScrollToBottom />
      <div className="flex space-x-6 px-4 pb-2">
        <SelectModel className="h-6 w-6" />
        <MessagesCount className="h-6 w-6" />
        <Temperature className="h-6 w-6" />
      </div>
      <PromptForm onSubmit={chat} placeholder={placeholder} {...props} />
    </div>
  )
}
