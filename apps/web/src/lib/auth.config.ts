import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

/**
 * Google OAuth is optional. If client id/secret are missing, Auth.js throws
 * [Configuration] and *all* sign-in (including credentials) fails — common when
 * production env omits Google but localhost .env.local has them.
 */
function googleProviders() {
  const id =
    process.env.AUTH_GOOGLE_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim()
  const secret =
    process.env.AUTH_GOOGLE_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!id || !secret) return []
  return [Google]
}

/**
 * Shared config without DB-backed providers. Middleware imports only this so the
 * Edge bundle does not pull in Prisma (@estateiq/database).
 * Credentials live in auth.ts and are merged for Node (API routes, server actions).
 */
export default {
  /**
   * Netlify / edge: forwarded Host may differ from NEXTAUTH_URL; without this,
   * CSRF/session cookies can fail in production while localhost still works.
   */
  trustHost: true,
  providers: googleProviders(),
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      if (typeof token.email === 'string') session.user.email = token.email
      if (typeof token.name === 'string') session.user.name = token.name
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        if (user.email) token.email = user.email
        if (user.name) token.name = user.name
      }
      return token
    },
  },
  pages: {
    signIn: '/sign-in',
    newUser: '/onboarding',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
} satisfies NextAuthConfig
