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
  const chats = await getChats(robot)
  return (
    <div className="flex">
      <div className="relative flex flex-1 flex-col">{children}</div>
      <ChatSidebar chats={chats} />
    </div>
  )
}
