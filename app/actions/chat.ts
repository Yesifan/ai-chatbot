'use server'

import { auth } from '@/auth'
import { ErrorCode } from '@/lib/constants'
import database from '@/lib/database'
import { nanoid } from '@/lib/utils'

export async function getChats(robotId?: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return []
  }

  try {
    const query = database
      .selectFrom('chat')
      .selectAll()
      .where('chat.userId', '=', userId)

    if (robotId) {
      query.where('chat.robotId', '=', robotId)
    } else {
      query.where('chat.robotId', 'is', null)
    }

    return await query
      .orderBy('isSaved', 'asc')
      .orderBy('lastMessageAt', 'desc')
      .execute()
  } catch (error) {
    console.error(`[ERROR][getChats] ${error}`)
    return []
  }
}

export const createChat = async (robotId?: string, isSaved?: boolean) => {
  const pk = nanoid()
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return {
      error: ErrorCode.Unauthorized
    }
  }
  return await database
    .insertInto('chat')
    .values({
      id: pk,
      userId,
      robotId,
      isSaved,
      title: 'Small Talk',
      createdAt: new Date()
    })
    .returning(['id', 'userId', 'title', 'createdAt'])
    .executeTakeFirstOrThrow()
}

// save default chat to a topic
export async function saveChat(chatId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return
  }

  try {
    const chat = await database
      .selectFrom('chat')
      .select('chat.robotId')
      .where('chat.id', '=', chatId)
      .where('chat.userId', '=', userId)
      .executeTakeFirst()

    if (!chat) {
      return {
        error: ErrorCode.NotFound
      }
    }

    if (!chat.robotId) {
      return {
        error: ErrorCode.BadRequest
      }
    }

    await database
      .updateTable('chat')
      .set({ isSaved: true })
      .where('chat.id', '=', chatId)
      .where('chat.userId', '=', userId)
      .execute()

    await createChat(chat.robotId)
  } catch (error) {
    console.error(`[ERROR][saveChat] ${error}`)
  }
}
