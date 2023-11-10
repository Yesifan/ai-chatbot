import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { ChatStoreProvider } from '@/lib/store/chat'

export const runtime = 'edge'

export default async function IndexPage() {
  const id = nanoid()

  return (
    <ChatStoreProvider id={id}>
      <Chat id={id} />
    </ChatStoreProvider>
  )
}
