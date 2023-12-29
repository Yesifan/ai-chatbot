'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

import { IconStar } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface FavoriteActionProps {
  id: string
  isFavorite?: boolean
  favorite?: (id: string, isFavorite: boolean) => Promise<boolean>
}

export function FavoriteAction({
  id,
  favorite,
  isFavorite
}: FavoriteActionProps) {
  const [isPending, starTransition] = React.useTransition()

  const favoriteHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
    event.preventDefault()
    event.stopPropagation()
    starTransition(async () => {
      await favorite?.(id, !isFavorite)
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="group/fav mr-1 h-6 w-6 p-0 hover:bg-transparent"
          disabled={isPending}
          onClick={favoriteHandler}
        >
          <IconStar
            className={cn(
              isPending && 'animate-spin',
              isFavorite
                ? 'fill-yellow-300 group-hover/fav:fill-yellow-300/80'
                : 'fill-primary group-hover/fav:fill-yellow-300'
            )}
          />
          <span className="sr-only">Favorite</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Favorite The Chat</TooltipContent>
    </Tooltip>
  )
}
