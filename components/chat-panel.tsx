import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { signIn, useSession } from 'next-auth/react'
import { Credential, Role } from '@/lib/constants'
import { nanoid } from 'nanoid'
import { UseChatHelpers } from '@/types/ai'

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

export function ChatPanel({ id, ...props }: ChatPanelProps) {
  const { data: session } = useSession()

  const login = useLogin()

  const chat = async (value: string) => {
    if (session?.user) {
      await props.append(value)
    } else {
      const result = await login(value)
      if (result !== true) {
        props.setMessages(messages => [
          ...messages,
          {
            id: nanoid(),
            content: result,
            role: Role.System
          }
        ])
      } else {
        // TODO: 如果 URL 中有跳转链接，登录后跳转
      }
    }
  }
  return (
    <div className="mt-auto bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm onSubmit={chat} {...props} />
        </div>
      </div>
    </div>
  )
}
