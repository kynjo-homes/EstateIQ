import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

const TAKE_DEFAULT = 50
const TAKE_MAX = 200

export async function GET(req: Request) {
  try {
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

    const { searchParams } = new URL(req.url)
    const raw = parseInt(searchParams.get('limit') ?? '', 10)
    const take = Number.isFinite(raw)
      ? Math.min(Math.max(raw, 1), TAKE_MAX)
      : TAKE_DEFAULT

    const [items, unreadCount] = await Promise.all([
      prisma.inAppNotification.findMany({
        where: { residentId: resident.id },
        orderBy: { createdAt: 'desc' },
        take,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          href: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.inAppNotification.count({
        where: { residentId: resident.id, readAt: null },
      }),
    ])

    return NextResponse.json({
      items: items.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        readAt: i.readAt?.toISOString() ?? null,
      })),
      unreadCount,
    })
  } catch (err) {
    logger.error('[GET /api/notifications]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
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

    const body = await req.json().catch(() => ({}))
    const markAllRead = body.markAllRead === true
    const ids: string[] | undefined = Array.isArray(body.ids) ? body.ids : undefined

    if (markAllRead) {
      await prisma.inAppNotification.updateMany({
        where: { residentId: resident.id, readAt: null },
        data: { readAt: new Date() },
      })
      return NextResponse.json({ ok: true })
    }

    if (ids?.length) {
      await prisma.inAppNotification.updateMany({
        where: {
          residentId: resident.id,
          id: { in: ids },
        },
        data: { readAt: new Date() },
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Provide markAllRead: true or ids: string[]' }, { status: 400 })
  } catch (err) {
    logger.error('[PATCH /api/notifications]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
