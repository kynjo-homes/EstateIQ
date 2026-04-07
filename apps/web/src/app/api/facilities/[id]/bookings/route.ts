import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: facilityId } = await params
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

    const { startTime, endTime } = await req.json()

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Start time and end time are required' },
        { status: 400 }
      )
    }

    const start = new Date(startTime)
    const end   = new Date(endTime)

    if (start >= end) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Booking must be in the future' },
        { status: 400 }
      )
    }

    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, estateId: resident.estateId },
    })
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 })
    }

    const conflict = await prisma.facilityBooking.findFirst({
      where: {
        facilityId,
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: end   } },
          { endTime:   { gt: start } },
        ],
      },
    })

    if (conflict) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose a different time.' },
        { status: 409 }
      )
    }

    const booking = await prisma.facilityBooking.create({
      data: {
        facilityId,
        residentId: resident.id,
        startTime:  start,
        endTime:    end,
        status:     'CONFIRMED',
      },
      include: {
        facility: { select: { name: true } },
        resident: { select: { firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (err: any) {
    logger.error('[POST /api/facilities/:id/bookings]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}