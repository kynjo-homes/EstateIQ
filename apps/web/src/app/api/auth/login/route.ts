import { NextResponse } from 'next/server'
import {
  authenticateCredentials,
  setWebSessionCookie,
} from '@/lib/credentials-login'
import { getClientIpFromRequest } from '@/lib/get-client-ip'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string
      password?: string
      turnstileToken?: string
    }
    const email = body.email ?? ''
    const password = body.password ?? ''
    const turnstileToken = body.turnstileToken?.trim()

    const result = await authenticateCredentials(
      email,
      password,
      turnstileToken || undefined,
      { remoteip: getClientIpFromRequest(req) }
    )

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    await setWebSessionCookie(result.user)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Unable to sign in. Please try again.' },
      { status: 500 }
    )
  }
}
