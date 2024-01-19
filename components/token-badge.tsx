import { memo } from 'react'
import { Badge, type BadgeProps } from './ui/badge'
import { useTokenCount } from '@/lib/hooks/use-token-count'
import { Tooltip } from './ui/tooltip-short'
import { OPENAI_PRICING_URL } from '@/lib/constants'

export interface TokenProps extends BadgeProps {
  input?: string
}

const Desc = () => (
  <div>
    <p>
      You can think of tokens as pieces of words, where 1,000 tokens is about
      750 words.
    </p>
    <p>
      And openai is priced by this,
      <a href={OPENAI_PRICING_URL} className="ml-1 underline" target="_blank">
        here is the price list.
      </a>
    </p>
  </div>
)

export const Token = memo(function Token({ input, ...props }: TokenProps) {
  const count = useTokenCount(input)
  return (
    <Tooltip desc={<Desc />}>
      <Badge {...props}>🆎 {count}</Badge>
    </Tooltip>
  )
})
