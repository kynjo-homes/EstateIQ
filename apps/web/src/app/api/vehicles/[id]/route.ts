import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

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

    await prisma.vehicle.update({
      where: { id, estateId: admin.estateId },
      data:  { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('[DELETE /api/vehicles/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Rotate scan token — invalidates old sticker
export async function PATCH(
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

    const { nanoid } = await import('nanoid')
    const vehicle = await prisma.vehicle.update({
      where: { id, estateId: admin.estateId },
      data:  { scanToken: nanoid(24) },
    })

    return NextResponse.json(vehicle)
  } catch (err: any) {
    logger.error('[PATCH /api/vehicles/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}