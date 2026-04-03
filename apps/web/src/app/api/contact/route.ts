import { NextResponse } from 'next/server'
import { sendContactFormEmail } from '@/lib/contactMailer'
import { sanitizeContactMessage, sanitizeEmail, sanitizeString } from '@/lib/sanitize'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  let body: { name?: string; email?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = sanitizeEmail(body.email ?? '')
  const name = sanitizeString(body.name ?? '')
  const message = sanitizeContactMessage(body.message ?? '')

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  try {
    await sendContactFormEmail({ name, email, message })
  } catch (e) {
    const code = (e as Error & { code?: string }).code
    if (code === 'MAILER_UNCONFIGURED') {
      return NextResponse.json(
        { error: 'Email is not configured on this server. Please email us directly.' },
        { status: 503 }
      )
    }
    console.error('[api/contact]', e)
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
