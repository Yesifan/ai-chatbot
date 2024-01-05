'use client'
import Link from 'next/link'
import { useTransition } from 'react'
import toast from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/markdown'
import { RobotAvatar } from '@/components/ui/avatar'
import { DEFAULT_ROBOT_TEMP } from '../[[...id]]/page'
import { Button } from '@/components/ui/button'
import { createRobot } from '@/app/actions/robot'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'

interface RobotCardProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  id?: string
}

export function RobotSidebar({ id, className, ...props }: RobotCardProps) {
  const router = useRouter()
  const [isLoading, startTransition] = useTransition()

  const template = DEFAULT_ROBOT_TEMP
  const createRobotHandler = async () => {
    startTransition(async () => {
      const res = await createRobot(template)
      if ('error' in res) {
        console.error('[RobotSidebar] create robot', res.error)
        toast.error('Create robot failed, please try again later.')
        return
      }
      const [chatId, robot] = res
      if (chatId) {
        router.push(`/chat/${robot.id}/${chatId}`)
      } else {
        router.push(`/chat/${robot.id}`)
        toast('Create robot success, but create chat failed.')
      }
    })
  }

  return (
    <div
      className={cn(
        'absolute lg:relative',
        id ? 'w-full lg:w-80' : 'w-0',
        'flex h-full overflow-hidden border-l transition-all',
        'bg-gradient-to-tr from-background/70 via-background/50 to-background/10 backdrop-blur-3xl',
        className
      )}
      {...props}
    >
      <div className="flex w-full min-w-80 flex-col items-center gap-2 p-4 pt-8">
        <RobotAvatar className="h-20 w-20 rounded bg-secondary p-2 " />
        <h3 className="mt-5 text-xl font-semibold">{template.name}</h3>
        <div className="text-xs text-primary/80">{template.description}</div>
        <div className="mt-2 h-[22px] w-full">
          {template.tags?.map(tag => (
            <Badge variant="secondary" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
        <Separator className="my-5" />
        <div className="min-h-10">
          <Markdown content={template.pinPrompt ?? ''} />
        </div>

        <Button
          className="mt-auto w-full"
          variant="highlight"
          isLoading={isLoading}
          onClick={createRobotHandler}
        >
          Creat The Robot
        </Button>
        <Button className="w-full" variant="secondary" asChild>
          <Link href="/robot">Cancel</Link>
        </Button>
      </div>
    </div>
  )
}
