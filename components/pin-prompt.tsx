'use client'

import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Markdown } from './markdown'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'
import { Token } from './token-badge'
import { ButtonCopy } from './copy-button'

export function PinPrompt({ content }: { content: string }) {
  const { ref, inView } = useInView({
    delay: 500,
    rootMargin: '150px 0px 0px 0px'
  })
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(content)
  }

  const scrollIntoView = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <>
      <div ref={ref} className="mx-auto mb-2 max-w-2xl px-4">
        <div className="flex flex-col rounded-lg border bg-background pb-8 pt-4">
          <div className="flex items-center px-6">
            <div className="flex flex-1 items-center space-x-2">
              <span className="text-primary/60">Prompt</span>
              <Token input={content} variant="outline" />
            </div>
            <ButtonCopy content={content} />
          </div>
          <div className="px-8">
            <Markdown content={content} />
          </div>
        </div>
      </div>
      <div
        className={cn(
          'sticky top-20 z-10 mx-auto h-px max-w-2xl px-4 transition-opacity',
          inView
            ? 'pointer-events-none opacity-0'
            : 'cursor-pointer opacity-100'
        )}
        onClick={scrollIntoView}
      >
        <div className="w-full rounded-lg border bg-background/60 px-4 py-2 backdrop-blur">
          <span className="block w-full truncate">{content.slice(0, 300)}</span>
        </div>
      </div>
    </>
  )
}
