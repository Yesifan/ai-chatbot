import {
  Tooltip as TooltipPrimitive,
  TooltipTrigger,
  TooltipContent,
  TooltipProps
} from '@/components/ui/tooltip'

// use <span> for asChild instead use forwaredRef
export const Tooltip = ({
  desc,
  children,
  ...props
}: TooltipProps & { desc: string }) => {
  return (
    <TooltipPrimitive>
      <TooltipTrigger {...props}>{children}</TooltipTrigger>
      <TooltipContent className="w-80 text-start">{desc}</TooltipContent>
    </TooltipPrimitive>
  )
}
