import { useEffect, useRef } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { Credential } from '../constants'

export const useLogin = () => {
  const { update } = useSession()

  const login = async (value: string) => {
    try {
      const res = await signIn(Credential.AccessToken, {
        redirect: false,
        token: value
      })
      if (res?.error) {
        return 'Login failed, Wrong access token!'
      } else {
        await update()
        return true
      }
    } catch (error: any) {
      console.error('[LOGININ]', error)
      return error.message || 'Login failed, please try again!'
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
