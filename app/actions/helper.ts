import database from '@/lib/database'
import { auth } from './auth'
import { ServerActionResult } from '@/types/database'

export async function isMessageOwner(
  id: string
): Promise<ServerActionResult<true>> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: 'Unauthorized'
    }
  }
  const chat = await database
    .selectFrom('chat')
    .where('chat.userId', '=', session.id)
    .leftJoin('message', join =>
      join.onRef('chat.id', '=', 'message.chatId').on('message.id', '=', id)
    )
    .select(['chat.id', 'chat.title'])
    .executeTakeFirst()

  if (chat?.id) {
    return true
  } else {
    return {
      ok: false,
      error: 'Unauthorized'
    }
  }
}
