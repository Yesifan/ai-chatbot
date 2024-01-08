'use server'
import database from '@/lib/database'
import { Message, ServerActionResult } from '@/types/database'
import { auth } from './auth'
import { ErrorCode } from '@/lib/constants'

export async function getMessages(
  id: string
): Promise<Message[] | { error: string }> {
  const session = await auth()
  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }
  return await database
    .selectFrom('message')
    .selectAll()
    .where('chatId', '=', id)
    .orderBy('createdAt')
    .execute()
}

// TODO: Ownership verification.
export async function removeMessage(id: string): Promise<ServerActionResult> {
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
    .executeTakeFirstOrThrow()

  if (chat.id) {
    const message = await database
      .deleteFrom('message')
      .where('message.id', '=', id)
      .executeTakeFirst()
    if (!message) {
      return {
        ok: false,
        error: ErrorCode.NotFound
      }
    }
    return {
      ok: true
    }
  } else {
    return {
      ok: false,
      error: ErrorCode.NotFound
    }
  }
}
