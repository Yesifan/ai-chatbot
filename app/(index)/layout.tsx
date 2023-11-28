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
    <div
      className={cn('flex h-screen overflow-hidden', isMobile && 'flex-col')}
    >
      {isMobile ? (
        <SafeArea />
      ) : (
        <Siderbar className="h-auto w-[300px] border-r" />
      )}
      <main
        className={cn(
          'relative flex flex-1 flex-col overflow-hidden bg-muted/50',
          isMobile ? 'w-screen' : 'h-screen'
        )}
      >
        {children}
      </main>
    </div>
  )
}
