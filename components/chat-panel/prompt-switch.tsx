'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

export const PromptSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, checked, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer relative inline-flex h-6 w-[4.5rem] shrink-0 cursor-pointer items-center overflow-hidden rounded-md border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default disabled:opacity-50 data-[state=checked]:bg-input data-[state=unchecked]:bg-input',
      className
    )}
    defaultChecked={false}
    checked={checked}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <div
      data-state={checked ? 'checked' : 'unchecked'}
      className="absolute right-[6px] text-xs text-primary transition-transform data-[state=checked]:translate-x-0 data-[state=unchecked]:translate-x-[3.3rem]"
    >
      Prompt
    </div>
    <div
      data-state={checked ? 'checked' : 'unchecked'}
      className="absolute left-4 text-xs text-primary transition-transform data-[state=checked]:translate-x-[-3.3rem] data-[state=unchecked]:translate-x-0"
    >
      Chat
    </div>
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-5 w-4 rounded-md bg-background shadow-lg ring-0 transition-all data-[state=unchecked]:w-5 data-[state=checked]:translate-x-0 data-[state=unchecked]:translate-x-[3rem]'
      )}
    />
  </SwitchPrimitives.Root>
))
PromptSwitch.displayName = SwitchPrimitives.Root.displayName
