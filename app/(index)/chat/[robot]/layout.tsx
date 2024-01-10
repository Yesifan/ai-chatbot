import { INBOX_PATH } from '@/lib/constants'
import { ChatSidebar } from '../../features/chat-history/chat-sidebar'
import { getChats } from '@/app/actions/chat'

interface LayoutProps {
  children: React.ReactNode
  params: {
    robot: string
  }
}

export default async function Layout({ children, params }: LayoutProps) {
  const { robot } = params
  const chats = await getChats(robot === INBOX_PATH ? undefined : robot)
  return (
    <>
      <div className="relative flex w-full flex-1 flex-col">{children}</div>
      <ChatSidebar chats={chats} className="z-20" />
    </>
  )
}
