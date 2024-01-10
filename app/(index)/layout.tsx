import { cn } from '@/lib/utils'
import { isMobileDevice } from '@/lib/utils/responsive'
import { Siderbar } from '../features/sidebar'

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
          'relative flex min-h-screen w-screen flex-1 bg-muted/50',
          isMobile ? '' : 'pl-[300px]'
        )}
      >
        {children}
      </main>
    </div>
  )
}
