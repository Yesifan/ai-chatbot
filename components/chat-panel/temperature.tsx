import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  TriggerProps
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { updateChat } from '@/app/actions'
import { useChatStore } from '@/lib/store/chat'
import { ATTACHED_MESSAGES_COUNT } from '@/lib/constants'

import { Slider } from '../ui/slider'
import { IconThermometer } from '../ui/icons'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProps
} from '../ui/tooltip'

// use <span> for asChild instead use forwaredRef
const TooltipIcon = (props: TooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild {...props}>
        <span>
          <IconThermometer />
        </span>
      </TooltipTrigger>
      <TooltipContent className="w-80 text-start">
        <p className="a text-xs">
          What sampling
          <a
            className="mx-1 underline opacity-80 transition hover:opacity-100"
            href="https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature"
            target="_blank"
          >
            temperature
          </a>
          to use, between 0 and 2.
        </p>
        <p className="a text-xs">
          Higher values like 0.8 will make the output more random, while lower
          values like 0.2 will make it more focused and deterministic.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

export interface MessageCountProps extends TriggerProps {}

export const Temperature = ({ className, ...props }: MessageCountProps) => {
  const { id, temperature, setTemperature } = useChatStore()
  const value = temperature ?? ATTACHED_MESSAGES_COUNT
  const onValueChange = (values: number[]) => {
    setTemperature?.(values[0])
  }

  const onValueCommit = (values: number[]) => {
    if (!id) return
    updateChat(id, { temperature: values[0] })
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'justify-center border-transparent p-0 text-gray-500 hover:bg-secondary hover:text-primary',
          className
        )}
        {...props}
      >
        <TooltipIcon />
      </PopoverTrigger>
      <PopoverContent className="flex w-56">
        <Slider
          className="mr-2"
          min={0}
          max={2}
          step={0.1}
          value={[value]}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
        />
        <p className="h-6 w-6 shrink-0 rounded bg-secondary py-1 text-center text-xs">
          {value}
        </p>
      </PopoverContent>
    </Popover>
  )
}
