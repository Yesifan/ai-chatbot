import { usePathname } from 'next/navigation'
import { INBOX_PATH } from '../constants'

const INBOX_CHAT_PATH = `/chat/${INBOX_PATH}`

export const useIsInbox = () => {
  const pathname = usePathname()
  const isInbox = pathname === '/' || pathname.startsWith(INBOX_CHAT_PATH)
  return isInbox
}
