import { memo } from 'react'
import { Badge, type BadgeProps } from './ui/badge'
import { useTokenCount } from '@/lib/hooks/use-token-count'
import { Tooltip } from './ui/tooltip-short'

export interface TokenProps extends BadgeProps {
  input?: string
}

export const Token = memo(function Token({ input, ...props }: TokenProps) {
  const count = useTokenCount(input)
  return (
    <Tooltip desc="Token is like a computer breaking a long sentence into small pieces when it understands what we say.">
      <Badge {...props}>🆎 {count}</Badge>
    </Tooltip>
  )
})
