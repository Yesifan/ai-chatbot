'use client'

import React from 'react'
import { User } from '@/types/database'
import { auth } from '@/app/actions/auth'

export type UpdateSession = (data?: User | false) => Promise<void>
export type SessionContextValue =
  | { update: UpdateSession; data: User; status: 'authenticated' }
  | {
      update: UpdateSession
      data: null
      status: 'unauthenticated' | 'loading'
    }

export interface SessionProviderProps {
  children: React.ReactNode
  session?: User
}

const SessionContext = React.createContext?.<SessionContextValue | undefined>(
  undefined
)

export const useSession = () => {
  const ctx = React.useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return ctx
}

export function SessionProvider({ children, ...props }: SessionProviderProps) {
  if (!SessionContext) {
    throw new Error('React Context is unavailable in Server Components')
  }

  const [session, setSession] = React.useState<User | undefined>(props.session)

  /** If session was passed, initialize as not loading */
  const [loading, startTransition] = React.useTransition()

  React.useEffect(() => {
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
      }
    }
    document.addEventListener('visibilitychange', visibilityHandler, false)
    return () =>
      document.removeEventListener('visibilitychange', visibilityHandler, false)
  }, [])

  const value: any = React.useMemo(() => {
    const status = loading
      ? 'loading'
      : session
      ? 'authenticated'
      : 'unauthenticated'
    const update: UpdateSession = async data => {
      if (loading) return

      startTransition(async () => {
        if (data) {
          setSession(data)
        }
        if (data === false) {
          setSession(undefined)
        } else {
          const newSession = await auth()
          if (newSession) {
            setSession(newSession)
          } else {
            setSession(undefined)
            console.error('[session update] get empty')
          }
        }
      })
    }
    return {
      data: session,
      status,
      update
    }
  }, [session, loading])

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
