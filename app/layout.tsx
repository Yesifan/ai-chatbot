import { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'

import { auth } from '@/auth'

import { cn } from '@/lib/utils'
import { fontMono, fontSans } from '@/lib/fonts'
import { Sidebar } from '@/components/sidebar'
import { Providers } from '@/components/providers'
import { TailwindIndicator } from '@/components/tailwind-indicator'

import '@/app/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(`http://localhost:${process.env.PORT || 3000}`),
  title: {
    default: 'Jarvis - AI Assistant',
    template: `%s - Jarvis Assistant`
  },
  description: 'An AI-powered chatbot.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/favicon.png'
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider session={session}>
            <div className="flex h-screen">
              <Sidebar />
              <main className="relative flex flex-1 flex-col bg-muted/50">
                {children}
              </main>
            </div>
          </SessionProvider>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
