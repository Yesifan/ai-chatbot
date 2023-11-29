import * as React from 'react'
import { UseChatHelpers } from 'ai/react'
import Textarea from 'react-textarea-autosize'

import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPause } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useMateEnterSubmit } from '@/lib/hooks/use-enter-submit'
import BubblesLoading from '../ui/loading'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput' | 'stop'> {
  onSubmit: (value: string) => Promise<void>
  isLoading: boolean
  placeholder?: string
}

export function EnterButton(props: { isLoading: boolean; disabled: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {props.isLoading ? (
          <Button variant="outline">
            <BubblesLoading />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={props.disabled}>
            <IconArrowElbow />
            <span className="sr-only">Send message</span>
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent>Send message</TooltipContent>
    </Tooltip>
  )
}

export function PromptForm({
  input,
  stop,
  onSubmit,
  setInput,
  isLoading,
  placeholder
}: PromptProps) {
  const { formRef, onKeyDown } = useMateEnterSubmit()
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
    <form
      ref={formRef}
      onSubmit={submit}
      className="relative flex w-full flex-col bg-background"
    >
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
        <EnterButton isLoading={isLoading} disabled={input === ''} />
        {isLoading && (
          <Button variant="outline" className="mr-2" onClick={stop}>
            <IconPause />
          </Button>
        )}
      </div>
    </form>
  )
}
