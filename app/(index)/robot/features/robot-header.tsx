import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SafeArea } from '@/components/ui/safe-area'

export async function RobotHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'bg-gradient-to-br from-background/70 via-background/50 to-background/10 backdrop-blur-3xl',
        className
      )}
    >
      <SafeArea className="bg-transparent" />
      <h1 className="flex h-16 items-center px-6 text-xl font-semibold">
        <Link href="/" className="pr-2">
          🌏
        </Link>
        <span>Robot Template</span>
      </h1>
    </header>
  )
}
