import { NextResponse } from 'next/server'
import { prisma } from '@estateiq/database'
import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'

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

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invitation link.' }, { status: 404 })
    }
    if (invite.usedAt) {
      return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 410 })
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This invitation link has expired. Please ask your estate admin to resend it.' }, { status: 410 })
    }

    const resident = await prisma.resident.findUnique({
      where: { id: invite.residentId },
      include: {
        estate: { select: { name: true, slug: true, address: true } },
      },
    })

    return NextResponse.json({
      valid:      true,
      email:      invite.email,
      firstName:  resident?.firstName,
      lastName:   resident?.lastName,
      estateName: resident?.estate?.name,
      estateSlug: resident?.estate?.slug,
      address:    resident?.estate?.address,
    })
  } catch (err: any) {
    logger.error('[GET /api/residents/accept-invite]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — set the password and activate the account
export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const invite = await prisma.inviteToken.findUnique({ where: { token } })

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invitation link.' }, { status: 404 })
    }
    if (invite.usedAt) {
      return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 410 })
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This invitation link has expired.' }, { status: 410 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction(async tx => {
      await tx.authUser.update({
        where: { email: invite.email },
        data:  {
          passwordHash,
          consentGiven:   true,
          consentGivenAt: new Date(),
        },
      })
    
      await tx.inviteToken.update({
        where: { token },
        data:  { usedAt: new Date() },
      })
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('[POST /api/residents/accept-invite]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}