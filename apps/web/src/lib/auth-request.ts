import { headers } from 'next/headers'
import { auth } from '@/lib/session'
import { getAuthSecretKey } from '@/lib/auth-cookie'
import { jwtVerify } from 'jose'

async function userIdFromMobileJwt(token: string | null): Promise<string | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey())
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

/**
 * Resolve AuthUser id for Route Handlers: web session cookie or `x-mobile-session` JWT.
 * Uses `headers()` so handlers do not need a `Request` argument.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id

  const h = await headers()
  return userIdFromMobileJwt(h.get('x-mobile-session'))
}

/**
 * Same as {@link getAuthUserId} but reads the mobile JWT from `request` (e.g. tests or non-standard contexts).
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id
  return userIdFromMobileJwt(request.headers.get('x-mobile-session'))
}
