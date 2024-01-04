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
import BubblesLoading from '@/components/ui/loading'

export function EnterButton(props: {
  className?: string
  isLoading: boolean
  disabled: boolean
  placeholder?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger className={props.className} asChild>
        {props.isLoading ? (
          <Button variant="outline">
            <BubblesLoading />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={props.disabled}>
            <IconArrowElbow />
            <span className="sr-only">
              {props.placeholder ?? 'Send message'}
            </span>
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent>{props.placeholder ?? 'Send message'}</TooltipContent>
    </Tooltip>
  )
}

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput' | 'stop'> {
  onSubmit: (value: string) => Promise<void>
  noPause?: boolean
  isLoading: boolean
  placeholder?: string
  isClearAfterSubmit?: boolean
}

export function PromptForm({
  input,
  stop,
  onSubmit,
  setInput,
  noPause,
  isLoading,
  placeholder,
  isClearAfterSubmit = true
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
      if (isClearAfterSubmit) {
        setInput('')
      }
      await onSubmit(input)
    },
    [input, isClearAfterSubmit, onSubmit, setInput]
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
      className="relative flex w-full flex-1 flex-col bg-background"
    >
      <div className="overflow-y-scroll px-4 pb-1">
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

      <div className="absolute bottom-0 right-0 flex flex-row space-x-2 p-4">
        {isLoading && !noPause && (
          <Button variant="outline" onClick={stop}>
            <IconPause />
          </Button>
        )}
        <EnterButton
          isLoading={isLoading}
          disabled={input === ''}
          placeholder={placeholder}
        />
      </div>
    </form>
  )
}
