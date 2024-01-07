'use server'

import db from '@/lib/database'
import { auth } from '@/app/actions/auth'
import { ActionErrorCode } from '@/lib/error'
import { nanoid } from '@/lib/utils'
import { Chat, Robot, ServerActionResult } from '@/types/database'
import {
  DEFAULT_ROBOT_NAME,
  DEFAULT_ROBOT_TEMP,
  ErrorCode,
  INBOX_CHAT
} from '@/lib/constants'
import { createChat } from './chat'
import { RobotTemplate } from '@/types/api'
import { getPageMarkdown, getPromptDatabase } from '../api/notion'
import { isNotionClientError } from '@notionhq/client'

export async function getRobot(id: string): Promise<ServerActionResult<Robot>> {
  const session = await auth()
  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }

  try {
    return await db
      .selectFrom('robot')
      .selectAll()
      .where('id', '=', id)
      .where('userId', '=', session.id)
      .executeTakeFirstOrThrow()
  } catch (e) {
    console.error('[get robot]', e)
    return {
      ok: false,
      error: ActionErrorCode.InternalServerError
    }
  }
}

type RobotWithLastMessage = Robot &
  Partial<Pick<Chat, 'lastMessage' | 'lastMessageAt'>>

export async function getRobots(): Promise<
  ServerActionResult<RobotWithLastMessage[]>
> {
  const session = await auth()
  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }
  const robots = await db
    .selectFrom('robot')
    .selectAll()
    .where('userId', '=', session.id)
    .orderBy('id')
    .execute()

  const chats = await db
    .selectFrom('chat')
    .select(['robotId', 'lastMessageAt', 'lastMessage'])
    .where('lastMessageAt', 'is not', null)
    .distinctOn('robotId')
    .orderBy('robotId')
    .orderBy('lastMessageAt', 'desc')
    .execute()

  return robots.map(robot => {
    const chat = chats.find(c => c.robotId === robot.id)
    return {
      ...robot,
      lastMessage: chat?.lastMessage,
      lastMessageAt: chat?.lastMessageAt
    }
  })
}

export async function createRobot(
  template?: RobotTemplate,
  prompt?: string
): Promise<ServerActionResult<[string | undefined, Robot]>> {
  const pk = nanoid()
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }

  try {
    const robot = await db
      .insertInto('robot')
      .values({
        id: pk,
        userId: session.id,
        icon: template?.icon,
        cover: template?.cover,
        createdAt: new Date(),
        description: template?.description,
        name: template?.name ?? DEFAULT_ROBOT_NAME,
        pinPrompt: prompt,
        input_template: template?.input_template
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    const inboxChat = await createChat(INBOX_CHAT, pk, false)
    if ('error' in inboxChat) {
      return [undefined, robot]
    }
    return [inboxChat.id, robot]
  } catch (e) {
    console.error('[createRobot]', e)
    return {
      ok: false,
      error: ActionErrorCode.InternalServerError
    }
  }
}

export async function removeRobot(id: string): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }

  const robot = await db
    .deleteFrom('robot')
    .where('robot.id', '=', id)
    .where('userId', '=', session.id)
    .executeTakeFirst()

  if (!robot) {
    return {
      ok: false,
      error: ErrorCode.NotFound
    }
  }

  return {
    ok: true
  }
}

// --- ROBOT TEMPLATE ---
export async function getRobotTemplates() {
  try {
    return await getPromptDatabase()
  } catch (e) {
    if (isNotionClientError(e)) {
      console.error('[error][notion][getPromptDatabase]', e.message)
    } else {
      console.error('[error][getPromptDatabase]', e)
    }
    return [DEFAULT_ROBOT_TEMP]
  }
}

export async function getTemplatePrompt(
  id: string
): Promise<ServerActionResult<string>> {
  try {
    return getPageMarkdown(id)
  } catch (e) {
    if (isNotionClientError(e)) {
      console.error('[error][notion][getTemplatePrompt]', e.message)
    } else {
      console.error('[error][getTemplatePrompt]', e)
    }
    return {
      ok: false,
      error: ErrorCode.InternalServerError
    }
  }
}
