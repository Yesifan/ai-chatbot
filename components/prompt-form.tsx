import * as React from 'react'
import { UseChatHelpers } from 'ai/react'
import Textarea from 'react-textarea-autosize'

import { Button } from '@/components/ui/button'
import { IconArrowElbow } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useMateEnterSubmit } from '@/lib/hooks/use-enter-submit'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => Promise<void>
  isLoading: boolean
  placeholder?: string
}

// TODO: 换行要根据光标，而不是直接插到尾部。
// TODO: 在使用输入法回车时会输入两次一样的内容。
export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
  placeholder
}: PromptProps) {
  const { formRef, onKeyDown } = useMateEnterSubmit(setInput)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const onKeyDown2 = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isLoading) {
        onKeyDown(event)
      }
    },
    [isLoading, onKeyDown]
  )

  const submit = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    async e => {
      e.preventDefault()
      if (!input?.trim()) {
        return
      }
      setInput('')
      await onSubmit(input)
    },
    [onSubmit, input, setInput]
  )

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form ref={formRef} onSubmit={submit}>
      <div className="relative flex w-full flex-col bg-background">
        <div className="h-24 overflow-y-scroll px-4">
          <Textarea
            ref={inputRef}
            tabIndex={0}
            onKeyDown={onKeyDown2}
            minRows={4}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder ?? 'Send a message.'}
            spellCheck={false}
            className="w-full resize-none bg-transparent focus-within:outline-none sm:text-sm"
          />
        </div>

        <div className="flex flex-row-reverse p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ''}
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
