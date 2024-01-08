'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/app/actions/auth'
import db from '@/lib/database'
import { Message, type Chat, ServerActionResult } from '@/types/database'
import { nanoid } from '@/lib/utils'
import { ActionErrorCode } from '@/lib/error'

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

// TODO: Ownership verification.
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

export async function getChat(id: string): Promise<[Chat, Message[]] | null> {
  const session = await auth()

  if (!session) {
    return null
  }

  try {
    const chat = await db
      .selectFrom('chat')
      .selectAll()
      .where('chat.id', '=', id)
      .where('chat.userId', '=', session.id)
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
    return { error: ActionErrorCode.Unauthorized }
  }

  const chat = await db
    .selectFrom('chat')
    .select('chat.title')
    .where('chat.id', '=', id)
    .where('chat.userId', '=', session.id)
    .executeTakeFirst()

  if (!chat) {
    return { error: ActionErrorCode.NotFound }
  }

  return chat.title
}

// TODO: 使用 robot id 为 key 进行删除，favorite 的不删除。
export async function clearChats(): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: 'Unauthorized'
    }
  }

  const chats = await db
    .selectFrom('chat')
    .select('chat.id')
    .where('userId', '=', session.id)
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
