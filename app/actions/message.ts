'use server'
import database from '@/lib/database'
import { Message, ServerActionResult } from '@/types/database'
import { auth } from './auth'

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

  const message = await database
    .deleteFrom('message')
    .where('message.id', '=', id)
    .executeTakeFirst()

  if (!message) {
    return {
      ok: false,
      error: 'Not found'
    }
  }

  return {
    ok: true
  }
}
