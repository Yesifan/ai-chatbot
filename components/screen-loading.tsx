import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import BubblesLoading from './ui/loading'
import { RobotAvatar } from './ui/avatar'

const ScreenLoading = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full flex-1 flex-col items-center justify-center p-16',
        className
      )}
      {...props}
    >
      <RobotAvatar className="border4 h-24 w-24 rounded bg-theme-gradient" />
      <BubblesLoading />
    </div>
  )
})

ScreenLoading.displayName = 'ScreenLoading'

export default ScreenLoading
