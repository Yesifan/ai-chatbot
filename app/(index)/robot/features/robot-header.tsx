import { SafeArea } from '@/components/ui/safe-area'
import { cn } from '@/lib/utils'
import { isMobileDevice } from '@/lib/utils/responsive.clint'
import Link from 'next/link'

export async function RobotHeader({ className }: { className?: string }) {
  const isMobile = isMobileDevice()
  return (
    <header
      className={cn(
        'bg-gradient-to-br from-background/70 via-background/50 to-background/10  backdrop-blur-3xl',
        className
      )}
    >
      {isMobile && <SafeArea />}
      <h1 className="flex h-16 items-center px-6 text-xl font-semibold">
        <Link href="/" className="pr-2">
          🌏
        </Link>
        Robot Template
      </h1>
    </header>
  )
}
