import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/app/actions/auth'
import { getChatWithMessage, getChat } from '@/app/actions/chat'
import { ChatStoreProvider } from '@/lib/store/chat'
import { isMobileDevice } from '@/lib/utils/responsive.clint'
import { Chat } from '@/app/(index)/features/chat'
import { ChatHeader } from '@/app/(index)/features/chat-header'
import { getRobot } from '@/app/actions/robot'

export const runtime = 'edge'

export interface ChatPageProps {
  params: {
    chat: string
    robot: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()
  const { robot, chat: chatId } = params
  if (!session) {
    redirect(`/?next=/chat/${robot}/${chatId}`)
  }

  const chat = await getChat(chatId)

  if ('error' in chat) {
    notFound()
  }

  return {
    title: chat.title
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chat: chatId } = params
  const isMobile = isMobileDevice()

  const chatAndMessage = await getChatWithMessage(chatId!)

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
        className="sticky top-0 z-10"
      />
      <Chat id={chatId} initialMessages={messages} />
    </ChatStoreProvider>
  )
}
