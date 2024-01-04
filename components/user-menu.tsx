'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from './ui/avatar'
import { signOut } from '@/lib/auth'
import { useSession } from '@/lib/auth/provider'

export function UserMenu() {
  const { data: session, update } = useSession()
  if (!session) {
    return null
  }

  const signOutHandler = async () => {
    signOut(true)
    update()
  }

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-2">
            <UserAvatar className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
          <DropdownMenuItem onClick={signOutHandler} className="text-xs">
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
