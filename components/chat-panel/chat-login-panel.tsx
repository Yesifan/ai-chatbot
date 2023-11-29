'use client'

import { signIn, useSession } from 'next-auth/react'

import { cn, nanoid } from '@/lib/utils'
import { Credential, Role } from '@/lib/constants'
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
  stop,
  isLoading,
  setLoading,
  className,
  ...props
}: Omit<ChatPanelProps, 'id'>) {
  const login = useLogin()
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
      const result = await login(password.trim())
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
    },
    [login, password, props, setLoading]
  )

  return (
    <div className={cn('bg-background shadow-lg', className)}>
      <form
        ref={formRef}
        onSubmit={submit}
        className="relative flex w-full items-center bg-background px-4 py-2"
      >
        <Input
          ref={inputRef}
          value={password}
          type="password"
          onKeyDown={onKeyDown2}
          placeholder={placeholder}
          onChange={e => setPassword(e.target.value)}
          className="mr-2 w-full resize-none sm:text-sm"
        />
        <EnterButton isLoading={isLoading} disabled={password === ''} />
      </form>
    </div>
  )
}
