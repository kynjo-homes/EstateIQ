import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

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

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isEstateAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(resident.role)

    const levy = await prisma.levy.findFirst({
      where: { id, estateId: resident.estateId },
      include: {
        estate: {
          select: {
            name:               true,
            duesBankName:       true,
            duesAccountNumber:  true,
          },
        },
      },
    })

    if (!levy) {
      return NextResponse.json({ error: 'Levy not found' }, { status: 404 })
    }

    const payments = await prisma.payment.findMany({
      where: isEstateAdmin
        ? { levyId: id }
        : {
            levyId: id,
            OR: [
              { residentId: resident.id },
              ...(resident.unitId ? [{ unitId: resident.unitId }] : []),
            ],
          },
      include: {
        unit:     { select: { id: true, number: true, block: true } },
        resident: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const residentCount = await prisma.resident.count({
      where: { estateId: resident.estateId, isActive: true },
    })

    return NextResponse.json({ ...levy, payments, residentCount })
  } catch (err: any) {
    logger.error('[GET /api/levies/:id]', { message: err.message, stack: err.stack })
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

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident || !['ADMIN', 'SUPER_ADMIN'].includes(resident.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { levyId: id } }),
      prisma.levy.delete({ where: { id, estateId: resident.estateId } }),
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('[DELETE /api/levies/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}