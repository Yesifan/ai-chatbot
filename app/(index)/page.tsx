import { Chat } from './features/chat'
import { ChatStoreProvider } from '@/lib/store/chat'
import { ChatHeader } from './features/chat-header'
import { getInboxChat, getMessages } from '../actions'
import { ErrorCode } from '@/lib/constants'
import { isMobileDevice } from '@/lib/utils/responsive'

export const runtime = 'edge'

export default async function IndexPage() {
  const chat = await getInboxChat()
  const isMobile = isMobileDevice()

  if ('error' in chat && chat.error !== ErrorCode.Unauthorized) {
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
      <ChatHeader className="sticky top-0 z-50" isMobile={isMobile} />
      <Chat id={id} initialMessages={messages} />
    </ChatStoreProvider>
  )
}
