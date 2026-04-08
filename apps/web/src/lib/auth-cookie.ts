import { SignJWT, jwtVerify } from 'jose'

/** Single web session cookie — no NextAuth / Auth.js. */
export const WEB_SESSION_COOKIE = 'estateiq.web_session'

export function getAuthSecretKey() {
  const s = process.env.AUTH_SECRET
  if (!s?.trim()) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(s)
}

export function sessionCookieOptions(): {
  httpOnly: boolean
  sameSite: 'lax'
  path: string
  maxAge: number
  secure: boolean
} {
  const secure = Boolean(
    process.env.NODE_ENV === 'production' ||
      process.env.AUTH_URL?.trim().startsWith('https://') ||
      process.env.NEXTAUTH_URL?.trim().startsWith('https://')
  )
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure,
  }
}

export async function signWebSessionToken(user: {
  id: string
  email: string
  name: string | null
}) {
  return new SignJWT({
    email: user.email,
    name: user.name ?? '',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getAuthSecretKey())
}

export async function verifyWebSessionToken(token: string) {
  const { payload } = await jwtVerify(token, getAuthSecretKey())
  const sub = typeof payload.sub === 'string' ? payload.sub : ''
  const email = typeof payload.email === 'string' ? payload.email : ''
  const name = typeof payload.name === 'string' ? payload.name : ''
  if (!sub || !email) throw new Error('Invalid session token')
  return { sub, email, name }
}
