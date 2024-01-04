import { parse, serialize } from 'cookie'
import { User } from '@/types/database'
import { AuthError } from '../error'
import { TOKEN_COOKIE_KEY } from '../constants'

export async function signIn(token: string) {
  try {
    const res = await fetch('/api/auth', {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Auth-Return-Redirect': '1'
      },
      body: JSON.stringify({
        token: token
      })
    })

    const data = await res.json()

    if (typeof data === 'string') {
      throw new AuthError(data, res.status)
    }

    if (!res.ok) {
      throw new AuthError('Fail', data.status)
    }

    return {
      ok: res.ok,
      status: res.status,
      session: data as User
    }
  } catch (e) {
    if (e instanceof AuthError) {
      return {
        error: e.message,
        status: e.statue,
        ok: false
      } as any
    }
  }
}

export async function signOut(redirect: boolean = false) {
  const token = parse(document.cookie)[TOKEN_COOKIE_KEY]
  if (token) {
    const tokenCookie = serialize(TOKEN_COOKIE_KEY, '', {
      expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT')
    })
    document.cookie = tokenCookie
    if (redirect) {
      window.location.href = '/'
    }
  }
}
