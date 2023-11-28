import { Metadata } from 'next'
import { cn } from '@/lib/utils'
import { SafeArea } from '@/components/ui/safe-area'
import { isMobileDevice } from '@/lib/utils/responsive'
import { redirect } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const isMobile = isMobileDevice()

  if (!isMobile) {
    redirect('/')
  }

  return {
    title: 'history'
  }
}

export default async function RootLayout({ children }: LayoutProps) {
  return (
    <div className={cn('flex h-screen flex-col overflow-hidden')}>
      <SafeArea />
      <main className={cn('relative flex-1 overflow-hidden bg-muted/50')}>
        {children}
      </main>
    </div>
  )
}
