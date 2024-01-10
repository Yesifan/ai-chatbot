import { Chat } from './features/chat'
import { ChatStoreProvider } from '@/lib/store/chat'
import { ChatHeader } from './features/chat-header'
import { getMessages } from '../actions/message'
import { getChats, getInboxChat } from '../actions/chat'
import { isMobileDevice } from '@/lib/utils/responsive'
import { ActionErrorCode } from '@/lib/error'
import { ChatSidebar } from './features/chat-history/chat-sidebar'

export const runtime = 'edge'

export default async function IndexPage() {
  const chat = await getInboxChat()
  const isMobile = isMobileDevice()

  if ('error' in chat && chat.error !== ActionErrorCode.Unauthorized) {
    console.error('[IndexPage] get chat', chat.error)
    return <div>Get Chat Some Error</div>
  }

  const id = 'error' in chat ? undefined : chat.id

  const chats = id ? await getChats() : []
  const messages = id ? await getMessages(id) : []

  if ('error' in messages) {
    console.error('[IndexPage] get chat', messages.error)
    return <div>Get Message Some Error</div>
  }

  return (
    <ChatStoreProvider {...chat}>
      <div className="relative flex flex-1 flex-col">
        <ChatHeader className="sticky top-0 z-50" isMobile={isMobile} />
        <Chat id={id} initialMessages={messages} />
      </div>
      <ChatSidebar chats={chats} />
    </ChatStoreProvider>
  )
}
