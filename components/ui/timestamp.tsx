import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const timestampVariants = cva('inline-flex items-center text-xs transition', {
  variants: {
    variant: {
      default: 'shadow hover:bg-primary/80',
      secondary:
        'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive:
        'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
      outline: 'text-foreground'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

export interface DatetimeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof timestampVariants> {
  date?: Date
}

function Timestamp({ className, variant, date, ...props }: DatetimeProps) {
  const now = new Date()
  if (!date) {
    return null
  }
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  ) {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return (
      <span
        className={cn(timestampVariants({ variant }), className)}
        {...props}
      >
        {hours < 10 ? `0${hours}` : hours}:
        {minutes < 10 ? `0${minutes}` : minutes}
      </span>
    )
  }
  return (
    <span className={cn(timestampVariants({ variant }), className)} {...props}>
      {date.getMonth()}/{date.getDate()}
    </span>
  )
}

export { Timestamp, timestampVariants }

export default Timestamp
