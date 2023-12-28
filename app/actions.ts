'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import db from '@/lib/database'
import { Message, type Chat, ServerActionResult } from '@/types/database'
import { ErrorCode, INBOX_CHAT } from '@/lib/constants'
import { nanoid } from '@/lib/utils'

export async function getMessages(
  id: string
): Promise<Message[] | { error: string }> {
  const session = await auth()
  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }
  return await db
    .selectFrom('message')
    .selectAll()
    .where('chatId', '=', id)
    .orderBy('createdAt')
    .execute()
}

export async function removeMessage(id: string): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: 'Unauthorized'
    }
  }

  const message = await db
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

export async function getChats() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return []
  }

  try {
    return await db
      .selectFrom('chat')
      .selectAll()
      .where('chat.userId', '=', userId)
      .where('chat.title', '!=', INBOX_CHAT)
      .orderBy('lastMessageAt', 'desc')
      .execute()
  } catch (error) {
    console.error(`[ERROR][getChats] ${error}`)
    return []
  }
}

export async function getChat(id: string): Promise<[Chat, Message[]] | null> {
  const session = await auth()

  if (!session) {
    return null
  }

  const user = session.user

  try {
    const chat = await db
      .selectFrom('chat')
      .selectAll()
      .where('chat.id', '=', id)
      .where('chat.userId', '=', user.id)
      .executeTakeFirst()

    if (!chat) {
      return null
    }

    const messageList = await db
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

export async function getInboxChat() {
  const session = await auth()

  if (!session) {
    return { error: ErrorCode.Unauthorized }
  }

  const user = session.user

  try {
    let chat = await db
      .selectFrom('chat')
      .selectAll()
      .where('title', '=', INBOX_CHAT)
      .where('chat.userId', '=', user.id)
      .orderBy('createdAt', 'asc')
      .limit(1)
      .executeTakeFirst()

    if (!chat) {
      chat = await db
        .insertInto('chat')
        .values({
          id: nanoid(),
          userId: user.id,
          title: INBOX_CHAT,
          createdAt: new Date(),
          attachedMessagesCount: 0
        })
        .returningAll()
        .executeTakeFirstOrThrow()
    }
    return chat
  } catch (error) {
    console.error(`[ERROR][getChats] ${error}`)
    return {
      error: ErrorCode.InternetError
    }
  }
}

export async function getChatTitle(id: string) {
  const session = await auth()

  if (!session) {
    return { error: ErrorCode.Unauthorized }
  }

  const user = session.user

  const chat = await db
    .selectFrom('chat')
    .select('chat.title')
    .where('chat.id', '=', id)
    .where('chat.userId', '=', user.id)
    .executeTakeFirst()

  if (!chat) {
    return { error: ErrorCode.NotFound }
  }

  return chat.title
}

export const createChat = async () => {
  const pk = nanoid()
  const session = await auth()
  if (!session) {
    return {
      error: ErrorCode.Unauthorized
    }
  }
  return await db
    .insertInto('chat')
    .values({
      id: pk,
      userId: session.user.id,
      title: 'New Chat',
      createdAt: new Date()
    })
    .returning(['id', 'userId', 'title', 'createdAt'])
    .executeTakeFirstOrThrow()
}

export async function updateChat(
  id: string,
  chat: Partial<Chat>
): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: ErrorCode.Unauthorized
    }
  }

  if (chat.id && chat.id !== id) {
    return {
      ok: false,
      error: ErrorCode.BadRequest
    }
  }

  const user = session.user

  if (chat.title === INBOX_CHAT) {
    return {
      ok: false,
      error: ErrorCode.BadRequest
    }
  }

  try {
    const updatedChat = await db
      .updateTable('chat')
      .set(chat)
      .where('chat.id', '=', id)
      .where('chat.userId', '=', user.id)
      .executeTakeFirstOrThrow()

    if (updatedChat.numUpdatedRows === BigInt(0)) {
      return {
        ok: false,
        error: ErrorCode.NotFound
      }
    }
    return {
      ok: true
    }
  } catch (e) {
    console.error('[UPDATE CHAT]', e)
    return {
      ok: false,
      error: ErrorCode.InternetError
    }
  }
}

export async function removeChat(id: string): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: ErrorCode.Unauthorized
    }
  }

  const user = session.user
  try {
    const chat = await db
      .deleteFrom('chat')
      .where('chat.id', '=', id)
      .where('chat.userId', '=', user.id)
      .executeTakeFirstOrThrow()

    if (chat.numDeletedRows === BigInt(0)) {
      return {
        ok: false,
        error: ErrorCode.NotFound
      }
    }

    await db
      .deleteFrom('message')
      .where('message.chatId', '=', id)
      .executeTakeFirstOrThrow()

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

export async function clearChats(): Promise<ServerActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      ok: false,
      error: 'Unauthorized'
    }
  }

  const chats = await db
    .selectFrom('chat')
    .select('chat.id')
    .where('userId', '=', session.user.id)
    .execute()
  chats.forEach(async chat => {
    await db
      .deleteFrom('message')
      .where('chatId', '=', chat.id)
      .executeTakeFirst()
    await db.deleteFrom('chat').where('id', '=', chat.id).executeTakeFirst()
  })

  revalidatePath('/')
  return redirect('/')
}
