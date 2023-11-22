import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const timestampVariants = cva(
  'inline-flex cursor-default items-center text-xs transition',
  {
    variants: {
      variant: {
        default: 'hover:text-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow',
        outline: 'text-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface DatetimeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof timestampVariants> {
  date?: Date
  full?: boolean
}

function Timestamp({
  className,
  variant,
  date,
  full,
  ...props
}: DatetimeProps) {
  const now = new Date()
  if (!date) {
    return null
  }
  const isToday =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const time = `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }`
  if (isToday) {
    return (
      <span
        className={cn(timestampVariants({ variant }), className)}
        {...props}
      >
        {time}
      </span>
    )
  }
  return (
    <span className={cn(timestampVariants({ variant }), className)} {...props}>
      {date.getMonth()}/{date.getDate()} {full ? time : null}
    </span>
  )
}

export { Timestamp, timestampVariants }

export default Timestamp
