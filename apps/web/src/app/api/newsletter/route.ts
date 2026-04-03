import { NextResponse } from 'next/server'
import { prisma, Prisma } from '@estateiq/database'
import { sendNewsletterSignupEmail } from '@/lib/contactMailer'
import { sanitizeEmail } from '@/lib/sanitize'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function sanitizeSource(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const s = raw.trim().slice(0, 64)
  if (s === 'footer' || s === 'contact') return s
  return undefined
}

export async function POST(req: Request) {
  let body: { email?: string; source?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = sanitizeEmail(body.email ?? '')
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const source = sanitizeSource(body.source)

  let isNewSubscriber = false
  try {
    await prisma.subscriber.create({
      data: { email, source: source ?? null },
    })
    isNewSubscriber = true
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return NextResponse.json({ ok: true, alreadySubscribed: true })
      }
      // P2021 = table does not exist (migration not applied)
      if (e.code === 'P2021') {
        console.error('[api/newsletter] Subscriber table missing — run db migration', e.meta)
        return NextResponse.json(
          {
            error:
              process.env.NODE_ENV === 'development'
                ? 'Subscriber table is missing. In apps/web run: npm run db:migrate (loads DATABASE_URL from .env.local).'
                : 'Could not save subscription. Please try again later.',
          },
          { status: 503 }
        )
      }
    }
    console.error('[api/newsletter] db', e)
    return NextResponse.json({ error: 'Could not save subscription. Please try again later.' }, { status: 500 })
  }

  if (isNewSubscriber) {
    try {
      await sendNewsletterSignupEmail(email)
    } catch (e) {
      const code = (e as Error & { code?: string }).code
      if (code === 'MAILER_UNCONFIGURED') {
        console.warn('[api/newsletter] mailer not configured; subscriber saved without notification email')
      } else {
        console.error('[api/newsletter] email', e)
      }
      // Subscriber is already persisted
    }
  }

  return NextResponse.json({ ok: true })
}
