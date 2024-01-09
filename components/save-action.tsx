'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

import { IconFloppyDisk } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface RemoveActionsProps {
  id: string
  save: (id: string) => Promise<boolean>
}

export function SaveAction({ id, save }: RemoveActionsProps) {
  const [isPending, starTransition] = React.useTransition()

  const saveChatHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
    event.preventDefault()
    starTransition(async () => {
      await save(id)
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-background"
          isLoading={isPending}
          onClick={saveChatHandler}
        >
          <IconFloppyDisk />
          <span className="sr-only">Save The Chat</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Save chat</TooltipContent>
    </Tooltip>
  )
}
