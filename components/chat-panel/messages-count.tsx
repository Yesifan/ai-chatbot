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
import { IconMessageaText } from '../ui/icons'
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
          <IconMessageaText className="h-[1.2rem] w-[1.2rem]" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="w-80 text-start">
        <p className="a text-xs">
          Upper limit of attached historical conversation. If it is 0, only the
          current message will be sent without attaching any conversation.
        </p>
        <p className="a text-xs">
          If it is 0, only the current message will be sent without attaching
          any conversation.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

export interface MessageCountProps extends TriggerProps {}

export const MessagesCount = ({ className, ...props }: MessageCountProps) => {
  const { id, attachedMessagesCount, setAttachedMessagesCount } = useChatStore()
  const value = attachedMessagesCount ?? ATTACHED_MESSAGES_COUNT
  const onValueChange = (values: number[]) => {
    setAttachedMessagesCount?.(values[0])
  }

  const onValueCommit = (values: number[]) => {
    updateChat(id, { attachedMessagesCount: values[0] })
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
      <PopoverContent className="flex w-48">
        <Slider
          className="mr-2"
          min={0}
          max={31}
          step={1}
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
