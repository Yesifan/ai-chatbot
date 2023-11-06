'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { IconMoon, IconSun } from '@/components/ui/icons'
import { Theme } from '@/lib/constants'

// TODO: theme 图标导致服务器渲染与客户端渲染不一致
export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [_, startTransition] = React.useTransition()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        startTransition(() => {
          setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light)
        })
      }}
    >
      {!theme ? null : theme === Theme.Dark ? (
        <IconMoon className="transition-all" />
      ) : (
        <IconSun className="transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default ThemeToggle
