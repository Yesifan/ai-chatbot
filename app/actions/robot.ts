'use server'

import { auth } from '@/app/actions/auth'
import db from '@/lib/database'
import { ActionErrorCode } from '@/lib/error'
import { Robot, ServerActionResult } from '@/types/database'

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
  return await db.selectFrom('robot').selectAll().orderBy('id').execute()
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
