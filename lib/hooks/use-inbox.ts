import { usePathname } from 'next/navigation'

export const useIsInbox = () => {
  const pathname = usePathname()
  const isInbox = pathname === '/'
  return isInbox
}
