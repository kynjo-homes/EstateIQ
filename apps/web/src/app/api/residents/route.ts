import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { sendInviteEmail } from '@/lib/email'
import crypto from 'crypto'
import { getPaginationParams, paginate } from '@/lib/paginate'
import { logger } from '@/lib/logger'


export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.resident.findUnique({
      where: { userId: session.user.id },
    })

    if (!admin) {
      return NextResponse.json([])
    }

    const { page, limit } = getPaginationParams(req.url)
    const where = { estateId: admin.estateId }

    const [residents, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        include: { unit: true },
        orderBy: { joinedAt: 'desc' },
        ...paginate(page, limit),
      }),
      prisma.resident.count({ where }),
    ])
  
    return NextResponse.json({
      data:       residents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore:    page * limit < total,
    })
  } catch (err: any) {
    logger.error('[GET /api/residents]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.resident.findUnique({
      where: { userId: session.user.id },
      include: { estate: true },
    })

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { firstName, lastName, email, phone, unitId, role } = body

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'First name, last name and email are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.resident.findFirst({
      where: { estateId: admin.estateId, email: email.trim() },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A resident with this email already exists' },
        { status: 409 }
      )
    }

    let authUser = await prisma.authUser.findUnique({
      where: { email: email.trim() },
    })
    if (!authUser) {
      authUser = await prisma.authUser.create({
        data: { email: email.trim(), name: `${firstName.trim()} ${lastName.trim()}` },
      })
    }

    const resident = await prisma.resident.create({
      data: {
        estateId:  admin.estateId,
        userId:    authUser.id,
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.trim(),
        phone:     phone?.trim() || null,
        unitId:    unitId || null,
        role:      role || 'RESIDENT',
      },
      include: { unit: true },
    })

    // Generate invite token
    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    await prisma.inviteToken.create({
      data: {
        token,
        email:      email.trim(),
        estateId:   admin.estateId,
        residentId: resident.id,
        expiresAt,
      },
    })

    const inviteUrl = `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`

    // Fire and forget — don't await, don't block the response
    sendInviteEmail({
      to:         email.trim(),
      firstName:  firstName.trim(),
      estateName: admin.estate.name,
      inviteUrl,
    }).catch(err => {
      logger.error('[Background email failed]', { message: err.message, stack: err.stack })
    })

    return NextResponse.json(resident, { status: 201 })
  } catch (err: any) {
    logger.error('[POST /api/residents]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}