'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { IconCheck, IconCopy } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'

export function ButtonCopy({
  content,
  ...props
}: { content: string } & ButtonProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(content)
  }

  return (
    <Button variant="ghost" size="icon" onClick={onCopy} {...props}>
      {isCopied ? <IconCheck /> : <IconCopy />}
      <span className="sr-only">Copy message</span>
    </Button>
  )
}
