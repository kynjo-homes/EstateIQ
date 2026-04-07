import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const where = ['ADMIN', 'SUPER_ADMIN'].includes(resident.role)
      ? { id: bookingId }
      : { id: bookingId, residentId: resident.id }

    const booking = await prisma.facilityBooking.update({
      where,
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json(booking)
  } catch (err: any) {
    logger.error('[PATCH /api/facilities/bookings/:bookingId]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}