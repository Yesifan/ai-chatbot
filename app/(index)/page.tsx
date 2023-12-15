import { Chat } from '@/components/chat'
import { ChatStoreProvider } from '@/lib/store/chat'
import { ChatHeader } from '@/components/chat-header'
import { getInboxChat, getMessages } from '../actions'
import { ErrorCode } from '@/lib/constants'

export const runtime = 'edge'

export default async function IndexPage() {
  const chat = await getInboxChat()

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
      <ChatHeader className="sticky top-0 z-50" />
      <Chat id={id} initialMessages={messages} />
    </ChatStoreProvider>
  )
}
