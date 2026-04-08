import { NextResponse } from 'next/server'
import { signWebSessionToken } from '@/lib/auth-cookie'
import {
  authenticateCredentials,
  clearWebSessionCookie,
  setWebSessionCookie,
} from '@/lib/credentials-login'
import { getClientIpFromRequest } from '@/lib/get-client-ip'
import { isLoginTestAllowed } from '@/lib/login-test-allowed'

type Step = { step: string; ok: boolean; detail?: string }

/**
 * Step-by-step login diagnostics (no session left at end — cookie is cleared).
 */
export async function POST(req: Request) {
  if (!isLoginTestAllowed()) {
    return NextResponse.json(
      { error: 'Login debug is disabled. Set ENABLE_LOGIN_TEST=true on the server or use localhost.' },
      { status: 403 }
    )
  }

  const steps: Step[] = []
  const push = (step: string, ok: boolean, detail?: string) =>
    steps.push({ step, ok, detail })

  try {
    const body = (await req.json()) as {
      email?: string
      password?: string
      turnstileToken?: string
    }

    const secret = process.env.AUTH_SECRET?.trim()
    push(
      'AUTH_SECRET',
      Boolean(secret && secret.length >= 32),
      secret ? `present (${secret.length} chars, min 32)` : 'missing or too short'
    )
    if (!secret || secret.length < 32) {
      return NextResponse.json({ ok: false, steps })
    }

    const email = body.email ?? ''
    const password = body.password ?? ''
    const turnstileToken = body.turnstileToken?.trim()

    const remoteip = getClientIpFromRequest(req)
    push(
      'Client IP (x-forwarded-for / x-real-ip)',
      true,
      remoteip ?? 'none — Turnstile may still work; if not, check Cloudflare hostname + keys'
    )

    const auth = await authenticateCredentials(
      email,
      password,
      turnstileToken || undefined,
      { remoteip, debugTurnstile: true }
    )

    if ('error' in auth) {
      const detail =
        auth.turnstileErrorCodes?.length
          ? `${auth.error} Cloudflare: ${auth.turnstileErrorCodes.join(', ')}`
          : auth.error
      push('authenticateCredentials (DB + bcrypt + Turnstile)', false, detail)
      return NextResponse.json({ ok: false, steps })
    }

    push(
      'authenticateCredentials',
      true,
      `user id prefix ${auth.user.id.slice(0, 8)}…`
    )

    try {
      await signWebSessionToken(auth.user)
      push('signWebSessionToken (JWT)', true)
    } catch (e) {
      push('signWebSessionToken (JWT)', false, String(e))
      return NextResponse.json({ ok: false, steps })
    }

    try {
      await setWebSessionCookie(auth.user)
      push('cookies().set (session cookie)', true)
    } catch (e) {
      push('cookies().set (session cookie)', false, String(e))
      return NextResponse.json({ ok: false, steps })
    }

    try {
      await clearWebSessionCookie()
      push('clearWebSessionCookie (cleanup)', true)
    } catch (e) {
      push('clearWebSessionCookie', false, String(e))
    }

    return NextResponse.json({ ok: true, steps })
  } catch (e) {
    push('unhandled', false, String(e))
    return NextResponse.json({ ok: false, steps }, { status: 500 })
  }
}
