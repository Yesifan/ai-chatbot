import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/app/actions/auth'
import { getChat, getChatTitle } from '@/app/actions'
import { ChatStoreProvider } from '@/lib/store/chat'
import { isMobileDevice } from '@/lib/utils/responsive.clint'
import { Chat } from '../../features/chat'
import { ChatHeader } from '../../features/chat-header'
import { getRobot } from '@/app/actions/robot'

export const runtime = 'edge'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session) {
    redirect(`/?next=/chat/${params.id}`)
  }

  const title = await getChatTitle(params.id)

  if (typeof title === 'object' && 'error' in title) {
    notFound()
  }

  return {
    title: title
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const id = params.id
  const isMobile = isMobileDevice()

  const chatAndMessage = await getChat(id)

  if (!chatAndMessage) {
    return null
  }
  const [chat, messages] = chatAndMessage

  const robotRes = chat.robotId ? await getRobot(chat.robotId) : undefined
  const robot = robotRes && 'error' in robotRes ? undefined : robotRes

  return (
    <ChatStoreProvider {...chat}>
      <ChatHeader
        robot={robot}
        isMobile={isMobile}
        className="sticky top-0 z-50"
      />
      <Chat id={id} initialMessages={messages} />
    </ChatStoreProvider>
  )
}
