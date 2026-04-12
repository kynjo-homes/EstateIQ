import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'
import { notifyResident } from '@/lib/notifyResident'

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

    const announcements = await prisma.announcement.findMany({
      where: { estateId: resident.estateId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(announcements)
  } catch (err) {
    logger.error('[GET /api/announcements]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
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

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        estateId: resident.estateId,
        title: title.trim(),
        body: body.trim(),
        priority: priority ?? 'NORMAL',
      },
    })

    const members = await prisma.resident.findMany({
      where: { estateId: resident.estateId, isActive: true },
      select: { id: true },
    })
    const preview = body.trim().slice(0, 280)
    for (const m of members) {
      await notifyResident(m.id, {
        type: 'ANNOUNCEMENT',
        title: `New announcement: ${title.trim()}`,
        body: preview,
        basePath: '/announcements',
        focus: { kind: 'ANNOUNCEMENT', id: announcement.id },
      })
    }

    return NextResponse.json(announcement, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/announcements]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}