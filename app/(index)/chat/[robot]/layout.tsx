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
  const robotId = robot === INBOX_PATH ? undefined : robot
  const chats = await getChats(robotId)
  return (
    <>
      <div className="relative flex w-full flex-1 flex-col">{children}</div>
      <ChatSidebar initialChats={chats} className="z-20" />
    </>
  )
}
