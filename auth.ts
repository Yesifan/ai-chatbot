import NextAuth, { type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

declare module 'next-auth' {
  interface Session {
    user: { id: string }
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental // will be removed in future
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        token: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const code = process.env.CODE
        if (code === credentials.token) {
          return { id: credentials.token as string }
        }
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)

        // Return null if user data could not be retrieved
        return null
      }
    })
  ],
  callbacks: {
    authorized({ request }) {
      return true // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
