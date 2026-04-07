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

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident || !['ADMIN', 'SUPER_ADMIN'].includes(resident.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.announcement.delete({
      where: { id, estateId: resident.estateId },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('[DELETE /api/announcements/:id]', { message: err.message, stack: err.stack })
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

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident || !['ADMIN', 'SUPER_ADMIN'].includes(resident.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, body, priority } = await req.json()

    const announcement = await prisma.announcement.update({
      where: { id, estateId: resident.estateId },
      data: {
        title:    title?.trim()  ?? undefined,
        body:     body?.trim()   ?? undefined,
        priority: priority       ?? undefined,
      },
    })

    return NextResponse.json(announcement)
  } catch (err: any) {
    logger.error('[PATCH /api/announcements/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}