import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/app/actions/auth'
import { getChat, getChatTitle } from '@/app/actions/chat'
import { ChatStoreProvider } from '@/lib/store/chat'
import { isMobileDevice } from '@/lib/utils/responsive.clint'
import { Chat } from '@/app/(index)/features/chat'
import { ChatHeader } from '@/app/(index)/features/chat-header'
import { getRobot } from '@/app/actions/robot'
import { getInboxChat } from '@/app/actions/chat'
import { INBOX_PATH } from '@/lib/constants'

export const runtime = 'edge'

export interface ChatPageProps {
  params: {
    chat: [string, string]
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()
  const [robotId, chatId] = params.chat
  if (!session) {
    redirect(`/?next=/chat/${robotId}/${chatId}`)
  }

  if (!robotId) {
    redirect('/')
  } else if (!chatId) {
    if (robotId === INBOX_PATH) {
      redirect('/')
    } else {
      const chat = await getInboxChat(robotId)
      if ('error' in chat) {
        notFound()
      } else {
        redirect(`/chat/${robotId}/${chat.id}`)
      }
    }
  } else {
    const title = await getChatTitle(chatId)

    if (typeof title === 'object' && 'error' in title) {
      notFound()
    }

    return {
      title: title
    }
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const [_robotId, chatId] = params.chat
  const isMobile = isMobileDevice()

  const chatAndMessage = await getChat(chatId!)

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
      <Chat id={chatId} initialMessages={messages} />
    </ChatStoreProvider>
  )
}
