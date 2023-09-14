import NextAuth, { type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

declare module 'next-auth' {
  interface Session {
    user: { id: string }
  }
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        token: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.debug('[AUTH AUTHORIZE]', credentials)
        try {
          if (credentials.token === process.env.ACCESS_CODE) {
            console.debug('[AUTH AUTHORIZE] SUCCESS')
            return { id: credentials.token as string }
          }
          return null
        } catch (e) {
          console.error('[AUTH AUTHORIZE][ERROR] ', e)
          return null
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
    // signIn: '/' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
