'use server'
import database from '@/lib/database'
import { Message, ServerActionResult } from '@/types/database'
import { auth } from './auth'
import { AssistantType, ErrorCode } from '@/lib/constants'
import { isMessageOwner } from './helper'
import { createKnowledgeManagementThread } from '../api/chat/assistants'

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
  const userId = await isMessageOwner(id)

  if (typeof userId === 'string') {
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
    return userId
  }
}

export async function favoriteMessage(
  id: string,
  isFavourite?: boolean
): Promise<ServerActionResult> {
  const userId = await isMessageOwner(id)

  if (typeof userId === 'string') {
    try {
      const message = await database
        .updateTable('message')
        .set({
          isFavourite: isFavourite
        })
        .returning(['content', 'title'])
        .where('message.id', '=', id)
        .executeTakeFirstOrThrow()

      if (isFavourite && !message.title) {
        const historyThread = await database
          .selectFrom('thread')
          .select(['id', 'status'])
          .where('messageId', '=', id)
          .where('type', '=', AssistantType.KNOWLEDGE_MANAGEMENT)
          .where('status', 'in', [
            'queued',
            'in_progress',
            'requires_action',
            'completed'
          ])
          .executeTakeFirst()
        if (!historyThread) {
          // create openai thread
          await createKnowledgeManagementThread(userId, id, message.content)
        }
      }
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
    return userId
  }
}
