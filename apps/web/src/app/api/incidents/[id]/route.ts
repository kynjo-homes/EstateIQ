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

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident || !['ADMIN', 'SUPER_ADMIN'].includes(resident.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { resolvedAt } = await req.json()

    const incident = await prisma.securityIncident.update({
      where: { id, estateId: resident.estateId },
      data: {
        resolvedAt: resolvedAt ? new Date(resolvedAt) : new Date(),
      },
    })

    return NextResponse.json(incident)
  } catch (err: any) {
    logger.error('[PATCH /api/incidents/:id]', { message: err.message, stack: err.stack })
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

    await prisma.securityIncident.delete({
      where: { id, estateId: resident.estateId },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('[DELETE /api/incidents/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}