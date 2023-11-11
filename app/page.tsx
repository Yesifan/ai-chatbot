import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { ChatStoreProvider } from '@/lib/store/chat'
import { ChatHeader } from '@/components/chat-header'

export const runtime = 'edge'

export default async function IndexPage() {
  const id = nanoid()

  return (
    <ChatStoreProvider id={id}>
      <ChatHeader className="absolute top-0 z-50" />
      <Chat id={id} />
    </ChatStoreProvider>
  )
}
