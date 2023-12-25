'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import db from '@/lib/database'
import { Message, type Chat, Robot, ServerActionResult } from '@/types/database'
import { ErrorCode, INBOX_CHAT } from '@/lib/constants'
import { nanoid } from '@/lib/utils'

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
