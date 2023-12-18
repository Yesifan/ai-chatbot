import React from 'react'
import { cn } from '@/lib/utils'

export const SafeArea = ({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('bg-background pb-safe-area-top', className)}
      {...props}
    />
  )
}
