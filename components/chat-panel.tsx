import { type UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { signIn, useSession } from 'next-auth/react'
import { Credential } from '@/lib/types'

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
  > {
  id?: string
}

export function ChatPanel({ id, messages, ...props }: ChatPanelProps) {
  const { data: session, update } = useSession()

  const login = async (value: string) => {
    try {
      const res = await signIn(Credential.AccessToken, {
        redirect: false,
        token: value
      })
      if (res?.error) {
        throw new Error(res.error)
      } else {
        await update()
      }
    } catch (error) {
      console.error('[LOGININ]error', error)
    }
  }
  const chat = async (value: string) => {
    if (!session?.user) {
      await login(value)
    } else {
      await props.append({
        id,
        content: value,
        role: 'user'
      })
    }
  }
  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {props.isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => props.reload()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm onSubmit={chat} {...props} />
        </div>
      </div>
    </div>
  )
}
