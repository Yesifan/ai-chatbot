'use client'

import * as React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'

import { IconStar } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface FavoriteButtonProps extends ButtonProps {
  id: string
  desc?: string
  isFavorite?: boolean
  favorite?: (id: string, isFavorite: boolean) => Promise<any>
}

export function FavoriteButton({
  id,
  desc,
  favorite,
  isFavorite,
  className,
  ...props
}: FavoriteButtonProps) {
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
          size="icon"
          className={cn('group/fav', className)}
          disabled={isPending}
          onClick={favoriteHandler}
          {...props}
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
      <TooltipContent>{desc ?? 'Favorite The Chat'}</TooltipContent>
    </Tooltip>
  )
}
