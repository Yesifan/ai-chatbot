'use server'
import database from '@/lib/database'
import { Message, ServerActionResult } from '@/types/database'
import { auth } from './auth'
import { AssistantType, ErrorCode } from '@/lib/constants'
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
      const result = await database
        .updateTable('message')
        .set({
          isFavourite: isFavourite
        })
        .returning(['content'])
        .where('message.id', '=', id)
        .executeTakeFirstOrThrow()
      console.log('favoriteMessage', result)
      if (isFavourite) {
        try {
          // create openai thread
          const run = await knowledgeManagementAssistant(result.content)
          if (run) {
            // save thread for corn task
            await database
              .insertInto('thread')
              .values({
                id: run.thread_id,
                runId: run.id,
                userId: userId,
                type: AssistantType.KNOWLEDGE_MANAGEMENT,
                status: run.status,
                createdAt: new Date()
              })
              .executeTakeFirstOrThrow()
          }
        } catch (e) {
          console.error('[favoriteMessage][knowledgeManagementAssistant]', e)
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
