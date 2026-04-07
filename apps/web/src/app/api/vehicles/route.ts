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
    if (!resident) return NextResponse.json([])

    const where = ['ADMIN', 'SUPER_ADMIN'].includes(resident.role)
      ? { estateId: resident.estateId }
      : { estateId: resident.estateId, residentId: resident.id }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        resident: {
          select: {
            firstName: true,
            lastName:  true,
            unit:      { select: { number: true, block: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(vehicles)
  } catch (err: any) {
    logger.error('[GET /api/vehicles]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { residentId, plateNumber, make, model, color } = await req.json()

    if (!residentId || !plateNumber?.trim()) {
      return NextResponse.json(
        { error: 'Resident and plate number are required' },
        { status: 400 }
      )
    }

    // Check plate not already registered in this estate
    const existing = await prisma.vehicle.findFirst({
      where: {
        estateId:    admin.estateId,
        plateNumber: plateNumber.trim().toUpperCase(),
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'This plate number is already registered in your estate' },
        { status: 409 }
      )
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        estateId:    admin.estateId,
        residentId,
        plateNumber: plateNumber.trim().toUpperCase(),
        make:        make?.trim()  || null,
        model:       model?.trim() || null,
        color:       color?.trim() || null,
      },
      include: {
        resident: {
          select: {
            firstName: true,
            lastName:  true,
            unit:      { select: { number: true, block: true } },
          },
        },
      },
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (err: any) {
    logger.error('[POST /api/vehicles]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}