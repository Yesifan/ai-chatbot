'use server'

import { TOKEN_COOKIE_KEY } from '@/lib/constants'
import database from '@/lib/database'
import { cookies } from 'next/headers'

export async function getLoginUser(token: string) {
  const user = await database
    .selectFrom('user')
    .selectAll()
    .where('accessToken', '=', token)
    .execute()
  if (user.length === 0) {
    return undefined
  }
  return user[0]
}

export async function auth() {
  const token = cookies().get(TOKEN_COOKIE_KEY)
  if (typeof token?.value !== 'string') {
    return undefined
  }
  try {
    const user = await getLoginUser(token.value)
    if (user) {
      return user
    } else {
      return undefined
    }
  } catch {
    return undefined
  }
}
