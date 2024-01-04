import { Chat } from './features/chat'
import { ChatStoreProvider } from '@/lib/store/chat'
import { ChatHeader } from './features/chat-header'
import { getMessages } from '../actions'
import { getInboxChat } from '../actions/chat'
import { isMobileDevice } from '@/lib/utils/responsive'
import { ActionErrorCode } from '@/lib/error'

export const runtime = 'edge'

export default async function IndexPage() {
  const chat = await getInboxChat()
  const isMobile = isMobileDevice()

  if ('error' in chat && chat.error !== ActionErrorCode.Unauthorized) {
    console.error('[IndexPage] get chat', chat.error)
    return <div>Get Chat Some Error</div>
  }

  const id = 'error' in chat ? undefined : chat.id

  const messages = id ? await getMessages(id) : []

  if ('error' in messages) {
    console.error('[IndexPage] get chat', messages.error)
    return <div>Get Message Some Error</div>
  }

  return (
    <ChatStoreProvider {...chat}>
      <ChatHeader className="sticky top-0 z-50" isMobile={isMobile} isInbox />
      <Chat id={id} initialMessages={messages} />
    </ChatStoreProvider>
  )
}
