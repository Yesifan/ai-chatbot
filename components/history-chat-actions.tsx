'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'

import { ServerActionResult } from '@/types/database'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { IconSpinner, IconTrash } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import toast from 'react-hot-toast'

interface ChatItemActionsProps {
  id: string
  removeChat: (id: string) => ServerActionResult
}

export function ChatItemActions({ id, removeChat }: ChatItemActionsProps) {
  const params = useParams()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()
  const router = useRouter()

  const removeChatHandler: React.MouseEventHandler<
    HTMLButtonElement
  > = event => {
    event.preventDefault()
    startRemoveTransition(async () => {
      const result = await removeChat(id)
      if (result.ok) {
        setDeleteDialogOpen(false)
        if (params?.id === id) {
          router.push('/')
        }
        toast.success(`Chat and ${result} messages deleted `)
      } else {
        toast.error(result.error)
        return
      }
    })
  }

  return (
    <>
      <div className="space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
      </div>

      {/* TODO: 修改为按钮二次确认，而不是弹窗二次确认。 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat message and remove your
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={removeChatHandler}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
