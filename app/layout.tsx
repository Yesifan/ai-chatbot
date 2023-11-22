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

const title = 'Jarvis - AI Assistant'

export const metadata: Metadata = {
  metadataBase: new URL(`http://localhost:${process.env.PORT || 3000}`),
  title: {
    default: title,
    template: `%s - Jarvis Assistant`
  },
  description: 'An AI-powered chatbot.',
  appleWebApp: {
    title: title,
    statusBarStyle: 'black-translucent'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/icon@2x.png'
  },
  manifest: '/manifest.json'
}

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  themeColor: [
    { color: '#f8f8f8', media: '(prefers-color-scheme: light)' },
    { color: '#000', media: '(prefers-color-scheme: dark)' }
  ],
  userScalable: false,
  viewportFit: 'cover',
  width: 'device-width'
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
