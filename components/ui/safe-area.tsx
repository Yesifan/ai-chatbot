import React from 'react'
import { cn } from '@/lib/utils'
import { isMobileDevice } from '@/lib/utils/responsive'

export const SafeArea = ({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) => {
  const isMobile = isMobileDevice()

  return isMobile ? (
    <div className={cn('bg-background pb-safe-are', className)} {...props} />
  ) : null
}
