'use client'
import { signIn, useSession } from 'next-auth/react'

import { cn, nanoid } from '@/lib/utils'
import {
  Credential,
  Role,
  SYSTEM_MESSAGE_COMMAND,
  SystemMessageKey
} from '@/lib/constants'
import { Input } from '../ui/input'
import { ChatPanelProps } from './chat-panel'
import { useCallback, useRef, useState } from 'react'
import { useMateEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { EnterButton } from './prompt-form'

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

const placeholder = 'Please enter access token here.'

export function ChatLoginPanel({
  className,
  setMessages
}: Pick<ChatPanelProps, 'className' | 'setMessages'>) {
  const login = useLogin()
  const [isLoading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { formRef, onKeyDown } = useMateEnterSubmit(false)

  const [password, setPassword] = useState('')

  const onKeyDown2 = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isLoading) {
        onKeyDown(event)
      }
    },
    [isLoading, onKeyDown]
  )

  const submit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async e => {
      e.preventDefault()
      setLoading(true)
      setPassword('')
      setMessages(messages => [
        ...messages,
        {
          id: nanoid(),
          content: `${SYSTEM_MESSAGE_COMMAND}:${SystemMessageKey.Logging}`,
          role: Role.System
        }
      ])
      const result = await login(password.trim())
      setLoading(false)
      if (result !== true) {
        setMessages(messages => {
          const oldMessages = messages.slice(0, -1)
          return [
            ...oldMessages,
            {
              id: nanoid(),
              content: `${SYSTEM_MESSAGE_COMMAND}:${SystemMessageKey.Warning}:${result}`,
              createdAt: new Date(),
              role: Role.System
            }
          ]
        })
      }
    },
    [login, password, setMessages]
  )

  return (
    <div className={cn('flex flex-col bg-background p-4 shadow-lg', className)}>
      <div className="leading-normal text-muted-foreground">
        🔑 Enter your Access Toekn to start the AI tour.
      </div>
      <form
        ref={formRef}
        onSubmit={submit}
        className="relative flex w-full items-center bg-background py-2 "
      >
        <Input
          ref={inputRef}
          value={password}
          type="password"
          onKeyDown={onKeyDown2}
          placeholder={placeholder}
          onChange={e => setPassword(e.target.value)}
          className="mr-2 w-full resize-none sm:text-sm md:max-w-2xl"
        />
        <EnterButton
          isLoading={isLoading}
          disabled={password === ''}
          placeholder="Login"
          className="flex w-20 flex-row-reverse"
        />
      </form>
    </div>
  )
}
