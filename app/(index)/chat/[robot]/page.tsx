import { auth } from '@/app/actions/auth'
import { getInboxChat } from '@/app/actions/chat'
import { INBOX_PATH } from '@/lib/constants'
import { notFound, redirect } from 'next/navigation'

export const runtime = 'edge'

export interface PageProps {
  params: {
    robot: string
  }
}

export default async function Page({ params }: PageProps) {
  const session = await auth()
  const { robot } = params

  if (!session) {
    redirect(`/?next=/chat/${robot}`)
  }

  if (robot === INBOX_PATH) {
    redirect('/')
  } else {
    const chat = await getInboxChat(robot)
    if ('id' in chat) {
      redirect(`/chat/${robot}/${chat.id}`)
    }
  }

  return notFound
}
