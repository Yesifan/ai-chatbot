'use client'
import Link from 'next/link'
import { useCallback, useState, useTransition } from 'react'
import toast from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/markdown'
import Avatar, { RobotAvatar } from '@/components/ui/avatar'
import { Button, ButtonProps } from '@/components/ui/button'
import { createRobot, getTemplatePrompt } from '@/app/actions/robot'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { RobotTemplate } from '@/types/api'
import BubblesLoading from '@/components/ui/loading'
import { useSession } from '@/lib/auth/provider'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { IconCheck, IconCopy } from '@/components/ui/icons'

interface RobotCardProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  prompt?: string
  template: RobotTemplate
}

const TryAgain = (props: ButtonProps) => (
  <p className="text-sm">
    Get prompt failed,
    <Button size="sm" variant="link" className="px-1 text-blue-500" {...props}>
      Please try again!
    </Button>
  </p>
)

export function RobotSidebar({
  prompt: _prompt,
  template,
  className,
  ...props
}: RobotCardProps) {
  const router = useRouter()
  const { status } = useSession()
  const [prompt, setPrompt] = useState(_prompt)
  const [isLoading, startTransition] = useTransition()
  const [isPromptLoading, startPTransition] = useTransition()
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const { id, name, icon, cover, description, tags } = template

  const getPrompt = useCallback(async () => {
    startPTransition(async () => {
      const res = await getTemplatePrompt(id)
      if (typeof res === 'string') {
        setPrompt(res)
      } else {
        toast.error(res.error ?? 'Get Prompt Error!')
      }
    })
  }, [id])

  const createRobotHandler = async () => {
    if (status === 'authenticated') {
      startTransition(async () => {
        const res = await createRobot(template, prompt)
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
    } else {
      router.push('/')
    }
  }

  return (
    <div
      className={cn(
        'absolute w-full min-w-80 lg:relative lg:w-96',
        'flex h-full flex-col items-center gap-2 overflow-auto border-l transition-all',
        'bg-gradient-to-tr from-background/70 via-background/50 to-background/10 backdrop-blur-3xl',
        className
      )}
      {...props}
    >
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
          <RobotAvatar className="h-20 w-20 rounded bg-secondary/20 p-2 backdrop-blur" />
        )}
        <h3 className="text-xl font-semibold drop-shadow-text dark:drop-shadow-text-dark">
          {name}
        </h3>
        <div className="text w-full text-primary drop-shadow-text dark:drop-shadow-text-dark">
          {description}
        </div>
        <div className="mt-2 h-[22px] w-full space-x-2">
          {tags?.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/30 backdrop-blur"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="relative mt-4 flex w-full justify-center px-3">
        <Separator className="absolute top-1/2" />
        <Badge
          variant="secondary"
          className="relative cursor-pointer"
          onClick={() => copyToClipboard(prompt)}
        >
          Prompt
          <span className="ml-2">
            {isCopied ? <IconCheck /> : <IconCopy />}
          </span>
        </Badge>
      </div>
      <div className="relative w-full flex-1 p-4">
        {isPromptLoading ? (
          <BubblesLoading />
        ) : prompt ? (
          <Markdown content={prompt} />
        ) : (
          <TryAgain onClick={getPrompt} />
        )}
      </div>
      <div className="flex w-full gap-2 px-4 pb-8">
        <Button
          size="lg"
          className="flex-1 px-0"
          variant="highlight"
          isLoading={isLoading}
          onClick={createRobotHandler}
        >
          {status === 'authenticated' ? 'Creat The Robot' : 'Login First'}
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/robot">Cancel</Link>
        </Button>
      </div>
    </div>
  )
}
