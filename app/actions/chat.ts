'use server'

import { auth } from '@/app/actions/auth'
import { DEFAULT_CHAT_NAME, INBOX_CHAT } from '@/lib/constants'
import database from '@/lib/database'
import { ActionErrorCode } from '@/lib/error'
import { nanoid } from '@/lib/utils'
import { Chat, ServerActionResult } from '@/types/database'

export async function getChats(robotId?: string) {
  const session = await auth()

  if (!session) {
    return []
  }

  try {
    const query = database
      .selectFrom('chat')
      .selectAll()
      .where('chat.userId', '=', session.id)

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
    return { error: ActionErrorCode.Unauthorized }
  }

  try {
    let chat = await database
      .selectFrom('chat')
      .selectAll()
      .where('chat.userId', '=', session.id)
      .where('chat.robotId', 'is', null)
      // Add this line to filter chats where isSaved is null or false
      .where('chat.isSaved', 'in', [null, false])
      .orderBy('createdAt', 'asc')
      .limit(1)
      .executeTakeFirst()
    if (!chat) {
      console.log('[getInboxChat] create new inbox chat')
      const res = await createChat(INBOX_CHAT, undefined, false)
      if ('error' in res) {
        console.error(`[ERROR][getInboxChat] ${res.error}`)
        return {
          error: ActionErrorCode.InternetError
        }
      } else {
        chat = res
      }
    }
    return chat
  } catch (error) {
    console.error(`[ERROR][getInboxChat] ${error}`)
    return {
      error: ActionErrorCode.InternetError
    }
  }
}

export const createChat = async (
  title: string,
  robotId?: string,
  isSaved = false
): Promise<ServerActionResult<Chat>> => {
  const pk = nanoid()
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }
  const chat = await database
    .insertInto('chat')
    .values({
      id: pk,
      userId: session.id,
      robotId,
      isSaved,
      title: title,
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

  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }

  try {
    const chat = await database
      .selectFrom('chat')
      .select(['chat.robotId', 'chat.isSaved'])
      .where('chat.id', '=', chatId)
      .where('chat.userId', '=', session.id)
      .executeTakeFirst()

    if (!chat) {
      return {
        ok: false,
        error: ActionErrorCode.NotFound
      }
    }

    if (chat.isSaved) {
      return {
        ok: false,
        error: ActionErrorCode.BadRequest,
        message: 'Chat is already saved'
      }
    }

    await database
      .updateTable('chat')
      .set({ isSaved: true })
      .where('chat.id', '=', chatId)
      .where('chat.userId', '=', session.id)
      .execute()

    await createChat(INBOX_CHAT, chat.robotId, false)
    return {
      ok: true
    }
  } catch (error) {
    console.error(`[ERROR][saveChat] ${error}`)
    return {
      ok: false,
      error: ActionErrorCode.InternetError
    }
  }
}

export async function updateChat(
  id: string,
  chat: Partial<Chat>
): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }

  if (chat.id && chat.id !== id) {
    return {
      ok: false,
      error: ActionErrorCode.BadRequest
    }
  }

  try {
    const updatedChat = await database
      .updateTable('chat')
      .set(chat)
      .where('chat.id', '=', id)
      .where('chat.userId', '=', session.id)
      .executeTakeFirstOrThrow()

    if (updatedChat.numUpdatedRows === BigInt(0)) {
      return {
        ok: false,
        error: ActionErrorCode.NotFound
      }
    }
    return {
      ok: true
    }
  } catch (e) {
    console.error('[UPDATE CHAT]', e)
    return {
      ok: false,
      error: ActionErrorCode.InternetError
    }
  }
}
