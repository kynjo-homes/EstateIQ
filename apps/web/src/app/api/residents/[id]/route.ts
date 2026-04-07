import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

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

    await prisma.resident.update({
      where: { id, estateId: admin.estateId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('[DELETE /api/residents/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}