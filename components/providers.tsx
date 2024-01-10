'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

import { TooltipProvider } from '@/components/ui/tooltip'
import { SessionProvider } from '@/lib/auth/provider'
import { User } from '@/types/database'
import { GlobalStoreProvider } from '@/lib/store/global'

interface ProviderProps extends ThemeProviderProps {
  session?: User
  isShowHistory?: boolean
}

export function Providers({
  children,
  session,
  isShowHistory,
  ...props
}: ProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      <SessionProvider session={session}>
        <TooltipProvider>
          <GlobalStoreProvider isChatSidebar={isShowHistory}>
            {children}
          </GlobalStoreProvider>
        </TooltipProvider>
      </SessionProvider>
    </NextThemesProvider>
  )
}
