import { cookies } from 'next/headers'
import { verifyWebSessionToken, WEB_SESSION_COOKIE } from './auth-cookie'

/**
 * App session shape (compatible with previous next-auth Session usage).
 */
export type AppSession = {
  user: {
    id: string
    email: string
    name: string
    image?: string | null
  }
}

/**
 * Server-only session from httpOnly JWT cookie. No NextAuth.
 */
export async function auth(): Promise<AppSession | null> {
  const jar = await cookies()
  const token = jar.get(WEB_SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const p = await verifyWebSessionToken(token)
    return {
      user: {
        id: p.sub,
        email: p.email,
        name: p.name,
        image: null,
      },
    }
  } catch {
    return null
  }
}
