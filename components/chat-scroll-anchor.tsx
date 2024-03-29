'use client'

import * as React from 'react'
import { useInView } from 'react-intersection-observer'

import { useAtBottom } from '@/lib/hooks/use-scroll'

interface ChatScrollAnchorProps {
  trackVisibility?: boolean
}

export function ChatScrollAnchor({ trackVisibility }: ChatScrollAnchorProps) {
  const isAtBottom = useAtBottom(30)
  const { ref, entry, inView } = useInView({
    trackVisibility,
    delay: 200,
    rootMargin: '0px 0px -150px 0px'
  })

  React.useEffect(() => {
    if (isAtBottom && trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      })
    }
  }, [inView, entry, isAtBottom, trackVisibility])

  return <div ref={ref} className="h-px w-full" />
}
