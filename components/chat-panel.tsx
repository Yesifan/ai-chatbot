import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { signIn, useSession } from 'next-auth/react'
import { Credential, Role } from '@/lib/constants'
import { UseChatHelpers } from '@/types/ai'
import { nanoid } from '@/lib/utils'

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
  const { data: session, update } = useSession()

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

  const login = useLogin()

  const placeholder =
    status === 'authenticated'
      ? 'Send a message.'
      : 'Please enter access token here.'

  const chat = async (value: string) => {
    if (status === 'authenticated') {
      await props.append(value)
    } else {
      console.log('login')
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
    <div className="mt-auto border bg-background pt-4 shadow-lg">
      <ButtonScrollToBottom />
      <div className="space-y-2">
        <PromptForm onSubmit={chat} placeholder={placeholder} {...props} />
      </div>
    </div>
  )
}
