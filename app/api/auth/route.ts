import { NextRequest } from 'next/server'
import { serialize } from 'cookie'

import database from '@/lib/database'
import { up } from '@/lib/database/migrations'
import { getLoginUser } from '@/app/actions/auth'
import { TOKEN_COOKIE_KEY } from '@/lib/constants'

export const runtime = 'edge'

async function getUserResponse(token: string) {
  const user = await getLoginUser(token)
  if (user) {
    // 计算30天后的日期
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000 // 30天的毫秒数
    const expiryDate = new Date(Date.now() + THIRTY_DAYS)

    return new Response(JSON.stringify(user), {
      status: 200,
      statusText: 'OK', // 状态文本
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': serialize(TOKEN_COOKIE_KEY, token, {
          path: '/',
          expires: expiryDate
        })
      }
    })
  } else {
    return new Response('credentials error', {
      status: 400
    })
  }
}

export async function POST(req: NextRequest) {
  const request = await req.json()
  const token = request.token
  if (!token) {
    return new Response('credentials error', {
      status: 400
    })
  }

  try {
    return await getUserResponse(token)
  } catch (e: any) {
    console.error('[SIGNIN]ERROR', e)
    if (e instanceof Error) {
      if (e.message.includes('does not exist')) {
        console.debug(
          '[DATABASE] Table does not exist, creating and seeding it with dummy data now...'
        )
        // Table is not created yet
        await up(database)
        console.debug('[DATABASE] success create database')
        return getUserResponse(token)
      } else {
        throw e
      }
    }
  }
}
