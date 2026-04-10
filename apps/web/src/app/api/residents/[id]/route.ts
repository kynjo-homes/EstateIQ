import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

/** Admin-only: payment, maintenance, incident, and vehicle history for a resident in the same estate. */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const target = await prisma.resident.findFirst({
      where: { id, estateId: admin.estateId },
      select: { id: true },
    })
    if (!target) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    const [payments, maintenanceRequests, incidents, vehicles] = await Promise.all([
      prisma.payment.findMany({
        where: { residentId: id, status: 'PAID' },
        orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
        include: { levy: { select: { title: true } } },
      }),
      prisma.maintenanceRequest.findMany({
        where: { estateId: admin.estateId, submittedBy: id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.securityIncident.findMany({
        where: { estateId: admin.estateId, reportedBy: id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.findMany({
        where: { estateId: admin.estateId, residentId: id },
        orderBy: { createdAt: 'desc' },
        select: {
          id:          true,
          plateNumber: true,
          make:        true,
          model:       true,
          color:       true,
          isActive:    true,
          createdAt:   true,
        },
      }),
    ])

    return NextResponse.json({ payments, maintenanceRequests, incidents, vehicles })
  } catch (err: any) {
    logger.error('[GET /api/residents/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const data = await req.json()

    const resident = await prisma.resident.update({
      where: { id, estateId: admin.estateId },
      data: {
        firstName: data.firstName ?? undefined,
        lastName:  data.lastName  ?? undefined,
        phone:     data.phone     ?? undefined,
        unitId:    data.unitId    ?? undefined,
        role:      data.role      ?? undefined,
        isActive:  data.isActive  ?? undefined,
      },
      include: { unit: true },
    })

    return NextResponse.json(resident)
  } catch (err: any) {
    logger.error('[PATCH /api/residents/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    if (admin.id === id) {
      return NextResponse.json(
        { error: 'You cannot remove your own account from the estate.' },
        { status: 400 }
      )
    }

    const target = await prisma.resident.findFirst({
      where: { id, estateId: admin.estateId },
      select: { id: true, userId: true },
    })
    if (!target) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    const authUserId = target.userId

    // Prisma interactive transactions default to timeout 5000ms — large deletes can exceed that.
    await prisma.$transaction(
      async tx => {
        await tx.inviteToken.deleteMany({ where: { residentId: id } })

        await tx.maintenanceRequest.updateMany({
          where: { assignedTo: id },
          data:  { assignedTo: null },
        })

        await tx.scanLog.deleteMany({ where: { residentId: id } })

        const vehicles = await tx.vehicle.findMany({
          where: { residentId: id },
          select: { id: true },
        })
        const vehicleIds = vehicles.map(v => v.id)
        if (vehicleIds.length > 0) {
          await tx.scanLog.deleteMany({ where: { vehicleId: { in: vehicleIds } } })
        }
        await tx.vehicle.deleteMany({ where: { residentId: id } })

        await tx.vote.deleteMany({ where: { residentId: id } })
        await tx.facilityBooking.deleteMany({ where: { residentId: id } })
        await tx.visitor.deleteMany({ where: { residentId: id } })
        await tx.payment.deleteMany({ where: { residentId: id } })
        await tx.maintenanceRequest.deleteMany({ where: { submittedBy: id } })
        await tx.securityIncident.deleteMany({ where: { reportedBy: id } })

        await tx.resident.delete({ where: { id, estateId: admin.estateId } })
        await tx.authUser.delete({ where: { id: authUserId } })
      },
      { maxWait: 10000, timeout: 60000 }
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('[DELETE /api/residents/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}