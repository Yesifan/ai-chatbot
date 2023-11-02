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
    const chats = await db
      .selectFrom('chat')
      .selectAll()
      .where('chat.id', '=', id)
      .where('chat.userId', '=', user.id)
      .execute()

    if (chats.length === 0) {
      return null
    }
    const chat = chats[0]

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

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  if (!!session?.user?.id) {
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
