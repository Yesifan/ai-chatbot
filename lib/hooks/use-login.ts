import { useEffect, useRef } from 'react'

import { signIn } from '../auth'
import { useSession } from '../auth/provider'

export const useLogin = () => {
  const { update } = useSession()

  const login = async (value: string) => {
    try {
      const res = await signIn(value)

      if (res?.error) {
        throw new Error('Login failed, Wrong access token!')
      } else {
        const session = await update()
        console.log('session', session)
        return session
      }
    } catch (error: any) {
      console.error('[LOGININ]', error)
      throw new Error(error.message || 'Login failed, please try again!')
    }
  }

  return login
}

type SessionStatus = 'authenticated' | 'loading' | 'unauthenticated'
export const useSessionStatusEffect = (
  effect: (status: SessionStatus) => void
) => {
  const { status } = useSession()
  const sessionStatusRef = useRef(status)

  useEffect(() => {
    if (sessionStatusRef.current !== status) {
      sessionStatusRef.current = status
      effect(status)
    }
  }, [effect, status])

  return status
}
