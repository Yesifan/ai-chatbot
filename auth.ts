import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import db from './lib/database'
import { up } from './lib/database/migrations'
import { Credential, User } from './lib/types'

declare module 'next-auth' {
  interface Session {
    user: User
  }
}

// TODO: 要不要 hash 后对比
const getLoginUser = async (token: string) => {
  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('accessToken', '=', token)
    .execute()
  if (user.length === 0) {
    throw new Error('The access token uploaded is not match.')
  }
  return user[0]
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [
    CredentialsProvider({
      id: Credential.AccessToken,
      name: 'AccessToken',
      credentials: {
        token: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const user = await getLoginUser(credentials.token as string)
          return user
        } catch (e: any) {
          console.error('[SIGNIN]ERROR', e)
          if (
            (e.message as string).includes(
              'The access token uploaded is not match'
            )
          ) {
            return null
          } else if ((e.message as string).includes('does not exist')) {
            console.debug(
              '[DATABASE] Table does not exist, creating and seeding it with dummy data now...'
            )
            // Table is not created yet
            await up(db)
            console.debug('[DATABASE] success create database')
            return getLoginUser(credentials.token as string)
          } else {
            throw e
          }
        }
      }
    })
  ],
  callbacks: {
    authorized({ auth }) {
      console.debug('[AUTH AUTHORIZED]', !!auth.user)
      return !!auth.user // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
