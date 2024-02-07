'use server'

import { TOKEN_COOKIE_KEY } from '@/lib/constants'
import database from '@/lib/database'
import { cookies } from 'next/headers'

export async function getLoginUser(token: string) {
  const user = await database
    .selectFrom('user')
    .selectAll()
    .where('accessToken', '=', token)
    .executeTakeFirstOrThrow()

  return user
}

export async function auth() {
  const token = cookies().get(TOKEN_COOKIE_KEY)
  if (typeof token?.value !== 'string') {
    return undefined
  }
  try {
    return await getLoginUser(token.value)
  } catch(e) {
    console.error('[AUTH]ERROR', e)
    return undefined
  }
}
