'use server'

import { auth } from '@/app/actions/auth'
import { ErrorCode, INBOX_CHAT } from '@/lib/constants'
import database from '@/lib/database'
import { ActionErrorCode } from '@/lib/error'
import { nanoid } from '@/lib/utils'
import { Chat, Message, ServerActionResult } from '@/types/database'
import { getRobot } from './robot'

export async function getChat(id: string): Promise<ServerActionResult<Chat>> {
  const session = await auth()

  if (!session) {
    return { ok: false, error: ActionErrorCode.Unauthorized }
  }

  const chat = await database
    .selectFrom('chat')
    .selectAll()
    .where('chat.id', '=', id)
    .where('chat.userId', '=', session.id)
    .executeTakeFirst()

  if (!chat) {
    return { ok: false, error: ActionErrorCode.NotFound }
  }

  return chat
}

export async function getInboxChat(robotId?: string) {
  const session = await auth()

  if (!session) {
    return { error: ActionErrorCode.Unauthorized }
  }

  try {
    let query = database.selectFrom('chat').selectAll()

    if (robotId) {
      query = query.where('chat.robotId', '=', robotId)
    } else {
      query = query.where('chat.robotId', 'is', null)
    }
    let chat = await query
      .where('chat.userId', '=', session.id)
      // Add this line to filter chats where isSaved is null or false
      .where('chat.isSaved', 'in', [null, false])
      .orderBy('createdAt', 'asc')
      .limit(1)
      .executeTakeFirst()
    if (!chat) {
      console.log('[getInboxChat] create new inbox chat')
      const res = await createChat(INBOX_CHAT, robotId, false)
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

export async function getChatWithMessage(
  id: string
): Promise<[Chat, Message[]] | null> {
  const session = await auth()

  if (!session) {
    return null
  }

  try {
    const chat = await database
      .selectFrom('chat')
      .selectAll()
      .where('chat.id', '=', id)
      .where('chat.userId', '=', session.id)
      .executeTakeFirst()

    if (!chat) {
      return null
    }

    const messageList = await database
      .selectFrom('message')
      .selectAll()
      .where('message.chatId', '=', id)
      .execute()

    return [chat, messageList]
  } catch (error) {
    console.error(`[ERROR][getChats] ${error}`)
    return null
  }
}

export async function getChats(robotId?: string) {
  const session = await auth()

  if (!session) {
    return []
  }

  try {
    let query = database.selectFrom('chat').selectAll()
    if (robotId) {
      query = query.where('robotId', '=', robotId)
    } else {
      query = query.where('robotId', 'is', null)
    }

    return await query
      .where('userId', '=', session.id)
      .orderBy('isSaved', 'asc')
      .orderBy('lastMessageAt', 'desc')
      .execute()
  } catch (error) {
    console.error(`[ERROR][getChats] ${error}`)
    return []
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
  const query = database.insertInto('chat')

  const values = {
    id: pk,
    userId: session.id,
    isSaved,
    title: title,
    createdAt: new Date()
  }
  try {
    if (robotId) {
      const robot = await getRobot(robotId)
      if ('error' in robot) {
        return robot
      } else {
        return query
          .values({
            ...values,
            robotId,
            model: robot.model,
            pinPrompt: robot.pinPrompt,
            temperature: robot.temperature,
            input_template: robot.input_template,
            attachedMessagesCount: robot.attachedMessagesCount
          })
          .returningAll()
          .executeTakeFirstOrThrow()
      }
    } else {
      return await query.values(values).returningAll().executeTakeFirstOrThrow()
    }
  } catch (e) {
    console.error('[error][createChat]', e)
    return {
      ok: false,
      error: ErrorCode.InternalServerError
    }
  }
}

// TODO: auto set title use ai.
// save default chat to a topic
export async function saveChat(id: string): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }

  try {
    const chat = await getChat(id)

    if ('error' in chat) {
      return chat
    }

    if (chat.isSaved) {
      return {
        ok: false,
        error: ActionErrorCode.BadRequest,
        message: 'Chat is already saved'
      }
    }

    await updateChat(id, { isSaved: true })

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

/**
 * Delete chat and the chat messages.
 * @param id chat id
 * @returns ServerActionResult
 */
export async function removeChat(id: string): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }

  try {
    const chat = await getChat(id)
    if ('error' in chat) {
      return chat
    }
    await database
      .deleteFrom('message')
      .where('chatId', '=', chat.id)
      .executeTakeFirst()
    await database
      .deleteFrom('chat')
      .where('id', '=', chat.id)
      .executeTakeFirst()

    return {
      ok: true
    }
  } catch (e) {
    console.error('[REMOVE CHAT]', e)
    return {
      ok: false,
      error: 'InternetError'
    }
  }
}

/**
 * 清除这个 robot id 下所有没有加星的 chat
 * @param robotId robot id
 * @param isRobotDel 如果为 true，则会把 favourite 的 chat 移动到 inbox。
 * @returns
 */
export async function clearRobotChats(
  robotId: string,
  isRobotDel?: boolean
): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: 'Unauthorized'
    }
  }

  try {
    const chats = await database
      .selectFrom('chat')
      .select(['chat.id', 'chat.isFavourite'])
      .where('userId', '=', session.id)
      .where('chat.robotId', '=', robotId)
      .execute()

    chats.forEach(async chat => {
      if (chat.isFavourite) {
        if (isRobotDel) {
          await updateChat(chat.id, { robotId: null as any, isSaved: true })
        }
      } else {
        await database
          .deleteFrom('message')
          .where('chatId', '=', chat.id)
          .executeTakeFirst()
        await database
          .deleteFrom('chat')
          .where('id', '=', chat.id)
          .executeTakeFirst()
      }
    })

    return {
      ok: true
    }
  } catch (e) {
    console.error('[clearRobotChats]', e)
    return {
      ok: false,
      error: ErrorCode.InternalServerError
    }
  }
}
