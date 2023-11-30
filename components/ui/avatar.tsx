'use client'

import * as RadixAvatar from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'
import RobotPic from '@/public/favicon.png'
import coffeePic from '@/public/images/coffee.webp'
import astronautPic from '@/public/images/astronaut.png'

export interface AvatarProps {
  src?: string
  className?: string
  fallback: string
}

const Avatar = ({ src, fallback, className }: AvatarProps) => (
  <RadixAvatar.Root
    className={cn(
      `flex h-10 w-10 items-center justify-center overflow-hidden text-xl`,
      className
    )}
  >
    {src && (
      <RadixAvatar.Image className="h-full w-full" src={src} alt={fallback} />
    )}
    <RadixAvatar.Fallback className="h-auto" delayMs={600}>
      {fallback}
    </RadixAvatar.Fallback>
  </RadixAvatar.Root>
)

export const UserAvatar: React.FC<{ className?: string }> = props => {
  return (
    <Avatar src={astronautPic.src} fallback="👩🏼‍🚀" className={props.className} />
  )
}

export const RobotAvatar: React.FC<{ className?: string }> = props => {
  return <Avatar src={RobotPic.src} fallback="🤖" className={props.className} />
}

export const InboxAvatar: React.FC<{ className?: string }> = props => {
  return (
    <Avatar src={coffeePic.src} fallback="☕" className={props.className} />
  )
}

export default Avatar
