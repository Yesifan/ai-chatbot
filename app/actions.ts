'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import db from '@/lib/database'
import { Message, type Chat } from '@/types/chat'
import { ErrorCode } from '@/lib/constants'

export async function removeMessage(id: string) {
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
    const chatList = await db
      .selectFrom('chat')
      .selectAll()
      .where('chat.userId', '=', userId)
      .execute()

    return chatList
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

export async function updateChat(id: string, chat: Partial<Chat>) {
  const session = await auth()

  if (!session) {
    return {
      error: ErrorCode.Unauthorized
    }
  }

  if (chat.id && chat.id !== id) {
    return {
      error: ErrorCode.BadRequest
    }
  }

  const user = session.user

  try {
    const updatedChat = await db
      .updateTable('chat')
      .set(chat)
      .where('chat.id', '=', id)
      .where('chat.userId', '=', user.id)
      .executeTakeFirstOrThrow()

    if (updatedChat.numUpdatedRows === BigInt(0)) {
      return {
        error: ErrorCode.NotFound
      }
    }
    return updatedChat.numUpdatedRows
  } catch (e) {
    console.error('[UPDATE CHAT]', e)
    return {
      error: ErrorCode.InternetError
    }
  }
}

export async function removeChat(id: string) {
  const session = await auth()

  if (!session) {
    return {
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
        error: ErrorCode.NotFound
      }
    }

    const messages = await db
      .deleteFrom('message')
      .where('message.chatId', '=', id)
      .executeTakeFirstOrThrow()

    return messages.numDeletedRows
  } catch (e) {
    console.error('[REMOVE CHAT]', e)
    return {
      error: 'InternetError'
    }
  }
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
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
