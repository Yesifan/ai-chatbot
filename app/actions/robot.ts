'use server'

import { auth } from '@/app/actions/auth'
import { DEFAULT_ROBOT_NAME, INBOX_CHAT } from '@/lib/constants'
import db from '@/lib/database'
import { ActionErrorCode } from '@/lib/error'
import { nanoid } from '@/lib/utils'
import { Robot, ServerActionResult } from '@/types/database'
import { createChat } from './chat'

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

export async function getRobots(): Promise<ServerActionResult<Robot[]>> {
  const session = await auth()
  if (!session) {
    return {
      ok: false,
      error: ActionErrorCode.Unauthorized
    }
  }
  return await db
    .selectFrom('robot')
    .selectAll()
    .where('userId', '=', session.id)
    .orderBy('id')
    .execute()
}

export async function createRobot(
  template?: Partial<Pick<Robot, 'name' | 'pinPrompt' | 'input_template'>>
) {
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
        name: template?.name ?? DEFAULT_ROBOT_NAME,
        pinPrompt: template?.pinPrompt,
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
      error: 'Not found'
    }
  }

  return {
    ok: true
  }
}
