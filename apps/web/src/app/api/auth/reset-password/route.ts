import { NextResponse } from 'next/server'
import { prisma } from '@estateiq/database'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const invite = await prisma.inviteToken.findUnique({
      where: { token },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link.' },
        { status: 404 }
      )
    }

    if (invite.usedAt) {
      return NextResponse.json(
        { error: 'This reset link has already been used.' },
        { status: 410 }
      )
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction(async tx => {
      await tx.authUser.update({
        where: { email: invite.email },
        data:  { passwordHash },
      })

      await tx.inviteToken.update({
        where: { token },
        data:  { usedAt: new Date() },
      })
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[POST /api/auth/reset-password]', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — validate token before showing the form
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const invite = await prisma.inviteToken.findUnique({
      where: { token },
    })

    if (!invite || invite.usedAt) {
      return NextResponse.json(
        { error: 'Invalid or already used reset link.' },
        { status: 404 }
      )
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    return NextResponse.json({ valid: true, email: invite.email })
  } catch (err: any) {
    console.error('[GET /api/auth/reset-password]', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}