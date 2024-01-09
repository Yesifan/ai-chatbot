import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  params: {
    robot: string
  }
}

export default async function RootLayout({ children }: LayoutProps) {
  return <div className={cn('flex flex-col')}>{children}</div>
}
