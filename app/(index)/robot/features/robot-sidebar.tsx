'use client'
import Link from 'next/link'
import { useTransition } from 'react'
import toast from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/markdown'
import Avatar, { RobotAvatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { createRobot } from '@/app/actions/robot'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { RobotTemplate } from '@/types/api'

interface RobotCardProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  template: RobotTemplate
}

export function RobotSidebar({
  template,
  className,
  ...props
}: RobotCardProps) {
  const router = useRouter()
  const [isLoading, startTransition] = useTransition()
  const { id, name, icon, cover, description, tags } = template
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
        'absolute w-full lg:relative lg:w-80',
        'flex h-full overflow-hidden border-l transition-all',
        'bg-gradient-to-tr from-background/70 via-background/50 to-background/10 backdrop-blur-3xl',
        className
      )}
      {...props}
    >
      <div className="flex w-full min-w-80 flex-col items-center gap-2">
        <div
          className="flex w-full flex-col items-center gap-2 bg-cover bg-center p-4 pt-8"
          style={{
            backgroundImage: cover ? `url(${cover})` : undefined
          }}
        >
          {icon ? (
            <Avatar
              className="h-20 w-20 rounded bg-secondary/20 p-2 text-[60px] backdrop-blur"
              fallback={icon.startsWith('http') ? '🤖' : icon}
              src={icon.startsWith('http') ? icon : undefined}
            />
          ) : (
            <RobotAvatar className="h-20 w-20 rounded bg-secondary/20 p-2 backdrop-blur " />
          )}
          <h3 className="mt-5 text-xl font-semibold drop-shadow-text dark:drop-shadow-text-dark">
            {template.name}
          </h3>
          <div className="text-xs text-primary/80 drop-shadow-text dark:drop-shadow-text-dark">
            {template.description}
          </div>
          <div className="mt-2 h-[22px] w-full">
            {template.tags?.map(tag => (
              <Badge
                variant="secondary"
                key={tag}
                className="bg-secondary/30 backdrop-blur"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="min-h-10">
          <Markdown content={template.pinPrompt ?? ''} />
        </div>
        <div className="mt-auto space-y-6 px-4 pb-8 ">
          <Button
            size="full"
            variant="highlight"
            isLoading={isLoading}
            onClick={createRobotHandler}
          >
            Creat The Robot
          </Button>
          <Button size="full" variant="secondary" asChild>
            <Link href="/robot">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
