'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import db from '@/lib/database'
import { Message, type Chat } from '@/types/chat'

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

export async function removeMessage(id: string) {
  const session = await auth()

  if (!session) {
    return {
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

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  revalidatePath('/')
  return revalidatePath(path)
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

export async function getSharedChat(id: string): Promise<Chat | null> {
  return null
}

export async function shareChat(chat: Chat) {
  const session = await auth()

  if (!session?.user?.id || session.user.id !== chat.userId) {
    return {
      error: 'Unauthorized'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  return payload
}
