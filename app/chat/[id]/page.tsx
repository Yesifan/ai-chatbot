import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat } from '@/app/actions'
import { Chat } from '@/components/chat'

export const runtime = 'edge'
export const preferredRegion = 'home'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user) {
    redirect(`/?next=/chat/${params.id}`)
  }

  const chatAndMessage = await getChat(params.id)

  if (!chatAndMessage) {
    notFound()
  }
  const [chat] = chatAndMessage

  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const id = params.id

  // const session = await auth()
  const chatAndMessage = await getChat(params.id)
  if (!chatAndMessage) {
    return null
  }
  const [_chat, messages] = chatAndMessage!

  return <Chat id={id} initialMessages={messages} />
}
