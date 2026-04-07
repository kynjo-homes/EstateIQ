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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        estateId: true,
        unit: { select: { number: true, block: true } },
        estate: { select: { name: true } },
      },
    })

    if (!resident) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(resident)
  } catch (err) {
    logger.error('[GET /api/residents/me]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}