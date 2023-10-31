import React from 'react'
import * as RadixAvatar from '@radix-ui/react-avatar'

export interface AvatarProps {
  src?: string
  fallback: string
}

const Avatar = ({ src, fallback }: AvatarProps) => (
  <RadixAvatar.Root className="flex h-10 w-10 items-center justify-center">
    {src && (
      <RadixAvatar.Image
        className="h-full w-full rounded-full"
        src={src}
        alt={fallback}
      />
    )}
    <RadixAvatar.Fallback className="h-auto text-xl" delayMs={600}>
      {fallback}
    </RadixAvatar.Fallback>
  </RadixAvatar.Root>
)

export const UserAvatar = () => {
  return <Avatar fallback="👩🏼‍🚀" />
}

export const RobotAvatar = () => {
  return <Avatar fallback="🤖" />
}

export default Avatar
