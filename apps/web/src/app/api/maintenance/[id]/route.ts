import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'
import { destroyCloudinaryAssets } from '@/lib/cloudinaryServer'

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
    if (!resident) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, estateId: resident.estateId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { status, assignedTo } = await req.json()
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(resident.role)

    if (isAdmin) {
      const updated = await prisma.maintenanceRequest.update({
        where: { id, estateId: resident.estateId },
        data: {
          status:     status     ?? undefined,
          assignedTo: assignedTo ?? undefined,
        },
      })
      return NextResponse.json(updated)
    }

    // Residents may only cancel (close) their own requests; workflow status changes are admin-only
    if (existing.submittedBy !== resident.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (assignedTo !== undefined) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (status !== 'CLOSED') {
      return NextResponse.json(
        { error: 'Only administrators can change request status. You may cancel your request instead.' },
        { status: 403 }
      )
    }
    if (existing.status === 'CLOSED') {
      return NextResponse.json({ error: 'Request is already closed' }, { status: 400 })
    }

    await destroyCloudinaryAssets(existing.mediaUrls)

    const updated = await prisma.maintenanceRequest.update({
      where: { id, estateId: resident.estateId },
      data: { status: 'CLOSED', mediaUrls: [] },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    logger.error('[PATCH /api/maintenance/:id]', { message: err.message, stack: err.stack })
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

    const toRemove = await prisma.maintenanceRequest.findFirst({
      where: { id, estateId: resident.estateId },
      select: { mediaUrls: true },
    })
    if (toRemove) {
      await destroyCloudinaryAssets(toRemove.mediaUrls)
    }

    await prisma.maintenanceRequest.delete({
      where: { id, estateId: resident.estateId },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('[DELETE /api/maintenance/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}