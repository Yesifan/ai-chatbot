import { cn } from '@/lib/utils'
import { IconOpenAI } from '../ui/icons'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  TriggerProps
} from '../ui/select'
import { GPT_Model } from '@/lib/constants'
import { useChatStore } from '@/lib/store/chat'
import { updateChat } from '@/app/actions'

export interface SelectModelProps extends TriggerProps {}

export const SelectModel = ({ className, ...props }: SelectModelProps) => {
  const { id, model, setModel } = useChatStore()

  const onValueChange = (values: GPT_Model) => {
    if (!id) return
    setModel?.(values)
    updateChat(id, { model: values })
  }

  return (
    <Select value={model} onValueChange={onValueChange}>
      <SelectTrigger
        hideIcon
        className={cn(
          'justify-center border-transparent p-0 text-gray-500 hover:bg-secondary hover:text-primary',
          className
        )}
        {...props}
      >
        <IconOpenAI />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value={GPT_Model.GPT_3_5_TURBO} className="text-xs">
          {GPT_Model.GPT_3_5_TURBO}
        </SelectItem>
        <SelectItem value={GPT_Model.GPT_4} className="text-xs">
          {GPT_Model.GPT_4}
        </SelectItem>
        <SelectItem value={GPT_Model.GPT_4_PREVIEW} className="text-xs">
          {GPT_Model.GPT_4_PREVIEW}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
