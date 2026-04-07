import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident) return NextResponse.json([])

    // Admins and security see all visitors; residents see only their own
    const where = ['ADMIN', 'SUPER_ADMIN', 'SECURITY'].includes(resident.role)
      ? { estateId: resident.estateId }
      : { estateId: resident.estateId, residentId: resident.id }

    const visitors = await prisma.visitor.findMany({
      where,
      include: {
        resident: {
          select: {
            firstName: true,
            lastName: true,
            unit: { select: { number: true, block: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(visitors)
  } catch (err) {
    logger.error('[GET /api/visitors]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    const { name, phone, purpose, expectedAt } = await req.json()

    if (!name?.trim() || !expectedAt) {
      return NextResponse.json(
        { error: 'Visitor name and expected arrival time are required' },
        { status: 400 }
      )
    }

    // Guarantee uniqueness of access code
    let accessCode = generateAccessCode()
    let exists = await prisma.visitor.findUnique({ where: { accessCode } })
    while (exists) {
      accessCode = generateAccessCode()
      exists = await prisma.visitor.findUnique({ where: { accessCode } })
    }

    const visitor = await prisma.visitor.create({
      data: {
        estateId:   resident.estateId,
        residentId: resident.id,
        name:       name.trim(),
        phone:      phone?.trim()   || null,
        purpose:    purpose?.trim() || null,
        accessCode,
        expectedAt: new Date(expectedAt),
        status:     'EXPECTED',
      },
      include: {
        resident: {
          select: {
            firstName: true,
            lastName: true,
            unit: { select: { number: true, block: true } },
          },
        },
      },
    })

    return NextResponse.json(visitor, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/visitors]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}