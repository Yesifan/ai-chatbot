'use server'

import { auth } from '@/auth'
import { ErrorCode, INBOX_CHAT } from '@/lib/constants'
import database from '@/lib/database'
import { nanoid } from '@/lib/utils'
import { Chat, ServerActionResult } from '@/types/database'

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

export async function getInboxChat() {
  const session = await auth()

  if (!session) {
    return { error: ErrorCode.Unauthorized }
  }

  const user = session.user

  try {
    let chat = await database
      .selectFrom('chat')
      .selectAll()
      .where('chat.userId', '=', user.id)
      .where('chat.robotId', 'is', null)
      // Add this line to filter chats where isSaved is null or false
      .where('chat.isSaved', 'in', [null, false])
      .orderBy('createdAt', 'asc')
      .limit(1)
      .executeTakeFirst()
    if (!chat) {
      console.log('[getInboxChat] create new inbox chat')
      const res = await createChat(undefined, false)
      if ('error' in res) {
        console.error(`[ERROR][getInboxChat] ${res.error}`)
        return {
          error: ErrorCode.InternetError
        }
      } else {
        chat = res
      }
    }
    return chat
  } catch (error) {
    console.error(`[ERROR][getInboxChat] ${error}`)
    return {
      error: ErrorCode.InternetError
    }
  }
}

export const createChat = async (
  robotId?: string,
  isSaved?: boolean
): Promise<ServerActionResult<Chat>> => {
  const pk = nanoid()
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return {
      ok: false,
      error: ErrorCode.Unauthorized
    }
  }
  const chat = await database
    .insertInto('chat')
    .values({
      id: pk,
      userId,
      robotId,
      isSaved,
      title: INBOX_CHAT,
      createdAt: new Date()
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return chat
}

// TODO: auto set title use ai.
// save default chat to a topic
export async function saveChat(chatId: string): Promise<ServerActionResult> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      ok: false,
      error: ErrorCode.Unauthorized
    }
  }

  try {
    const chat = await database
      .selectFrom('chat')
      .select(['chat.robotId', 'chat.isSaved'])
      .where('chat.id', '=', chatId)
      .where('chat.userId', '=', userId)
      .executeTakeFirst()

    if (!chat) {
      return {
        ok: false,
        error: ErrorCode.NotFound
      }
    }

    if (chat.isSaved) {
      return {
        ok: false,
        error: ErrorCode.BadRequest,
        message: 'Chat is already saved'
      }
    }

    await database
      .updateTable('chat')
      .set({ isSaved: true })
      .where('chat.id', '=', chatId)
      .where('chat.userId', '=', userId)
      .execute()

    await createChat(chat.robotId, false)
    return {
      ok: true
    }
  } catch (error) {
    console.error(`[ERROR][saveChat] ${error}`)
    return {
      ok: false,
      error: ErrorCode.InternetError
    }
  }
}
