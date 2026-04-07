import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })

    if (!resident) {
      // Not onboarded yet — return empty array instead of 404
      return NextResponse.json([])
    }

    const units = await prisma.unit.findMany({
      where: { estateId: resident.estateId },
      orderBy: [{ block: 'asc' }, { number: 'asc' }],
    })

    return NextResponse.json(units)
  } catch (err) {
    logger.error('[GET /api/units]', {
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

    if (!resident || !['ADMIN', 'SUPER_ADMIN'].includes(resident.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { number, block, type } = body

    if (!number?.trim()) {
      return NextResponse.json({ error: 'Unit number is required' }, { status: 400 })
    }

    const unit = await prisma.unit.create({
      data: {
        estateId: resident.estateId,
        number: number.trim(),
        block: block?.trim() || null,
        type: type?.trim() || null,
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/units]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}