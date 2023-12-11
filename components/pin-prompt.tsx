'use client'

import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Markdown } from './markdown'
import { Button } from './ui/button'
import { IconCheck, IconCopy } from './ui/icons'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'

export function PinPrompt({ content }: { content: string }) {
  const { ref, entry, inView } = useInView({
    delay: 500,
    rootMargin: '-150px 0px 0px 0px'
  })
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(content)
  }

  const scrollIntoView = () => {
    entry?.target.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  return (
    <>
      <div ref={ref} className="mx-auto mb-8 max-w-2xl px-4">
        <div className="flex flex-col rounded-lg border bg-background pb-8 pt-4">
          <div className="flex items-center px-6">
            <span className="mr-auto text-primary/60">Prompt</span>
            <Button variant="ghost" size="icon" onClick={onCopy}>
              {isCopied ? <IconCheck /> : <IconCopy />}
              <span className="sr-only">Copy message</span>
            </Button>
          </div>
          <div className="px-8">
            <Markdown content={content} />
          </div>
        </div>
      </div>
      <div
        className={cn(
          'absolute left-1/2 top-20 z-10 max-w-2xl -translate-x-1/2 px-4 transition-opacity',
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
