'use server'
import database from '@/lib/database'
import { Message, ServerActionResult } from '@/types/database'
import { auth } from './auth'
import { ErrorCode } from '@/lib/constants'
import { isMessageOwner } from './helper'
import { knowledgeManagementAssistant } from '../api/chat/assistants'

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

export async function removeMessage(id: string): Promise<ServerActionResult> {
  const isOwner = await isMessageOwner(id)

  if (isOwner) {
    const message = await database
      .deleteFrom('message')
      .where('message.id', '=', id)
      .executeTakeFirst()
    if (!message) {
      return {
        ok: false,
        error: ErrorCode.NotFound
      }
    }
    return {
      ok: true
    }
  } else {
    return isOwner
  }
}

export async function favouriteMessage(
  id: string
): Promise<ServerActionResult> {
  const isOwner = await isMessageOwner(id)

  if (isOwner) {
    try {
      const result = await database
        .updateTable('message')
        .set({
          isFavourite: true
        })
        .returning(['content'])
        .where('message.id', '=', id)
        .executeTakeFirstOrThrow()

      knowledgeManagementAssistant(result.content).then(res => {
        console.log('knowledgeManagementAssistant', res)
      })

      console.log('Favorite Success!')
      return {
        ok: true
      }
    } catch (e) {
      console.error('[favoriteMessage][error]', e)
      return {
        ok: false,
        error: ErrorCode.InternalServerError
      }
    }
  } else {
    return isOwner
  }
}
