import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId: session.user.id },
    })
    if (!resident) return NextResponse.json([])

    const bookings = await prisma.facilityBooking.findMany({
      where: { residentId: resident.id },
      include: {
        facility: { select: { name: true, description: true } },
      },
      orderBy: { startTime: 'desc' },
      take: 20,
    })

    return NextResponse.json(bookings)
  } catch (err) {
    logger.error('[GET /api/facilities/bookings/mine]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}