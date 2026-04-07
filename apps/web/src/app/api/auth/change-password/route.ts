import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/rateLimit'
import { getPasswordPolicyErrorMessage, passwordMeetsPolicy } from '@/lib/passwordPolicy'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowMs: 15 * 60 * 1000 })
  if (limited) return limited

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = body as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password.' },
        { status: 400 }
      )
    }

    if (!passwordMeetsPolicy(newPassword)) {
      return NextResponse.json({ error: getPasswordPolicyErrorMessage() }, { status: 400 })
    }

    const user = await prisma.authUser.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            'Password sign-in is not set for this account. Sign in with Google or use “Forgot password” to add a password.',
          code: 'NO_PASSWORD',
        },
        { status: 403 }
      )
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.authUser.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('[POST /api/auth/change-password]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
