import { cn } from '@/lib/utils'
import { isMobileDevice } from '@/lib/utils/responsive'
import { SafeArea } from '@/components/ui/safe-area'
import { Siderbar } from '@/components/sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: LayoutProps) {
  const isMobile = isMobileDevice()

  return (
    <div className={cn('flex', isMobile && 'flex-col')}>
      {!isMobile && (
        <Siderbar className="fixed z-10 h-screen w-[300px] border-r" />
      )}
      <main
        className={cn(
          'relative flex min-h-screen flex-1 flex-col bg-muted/50',
          isMobile ? 'w-screen' : 'pl-[300px]'
        )}
      >
        {children}
      </main>
    </div>
  )
}
