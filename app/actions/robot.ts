'use server'

import { auth } from '@/auth'
import db from '@/lib/database'
import { Robot, ServerActionResult } from '@/types/database'

export async function getRobots(): Promise<ServerActionResult<Robot[]>> {
  const session = await auth()
  if (!session) {
    return {
      ok: false,
      error: 'Unauthorized'
    }
  }
  return await db.selectFrom('robot').selectAll().orderBy('id').execute()
}

export async function removeRobot(id: string): Promise<ServerActionResult> {
  const session = await auth()

  if (!session) {
    return {
      ok: false,
      error: 'Unauthorized'
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
