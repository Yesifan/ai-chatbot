import { Chat } from '@/components/chat'
import { ChatStoreProvider } from '@/lib/store/chat'
import { ChatHeader } from '@/components/chat-header'
import { getInboxChat, getMessages } from './actions'

export const runtime = 'edge'

export default async function IndexPage() {
  const chat = await getInboxChat()

  if ('error' in chat) {
    return <div>Get Chat Some Error</div>
  }

  const messages = await getMessages(chat.id)

  if ('error' in messages) {
    return <div>Get Message Some Error</div>
  }

  return (
    <ChatStoreProvider {...chat}>
      <ChatHeader className="absolute top-0 z-50" />
      <Chat id={chat.id} initialMessages={messages} />
    </ChatStoreProvider>
  )
}
