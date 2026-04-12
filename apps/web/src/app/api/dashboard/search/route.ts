import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

const LIMIT = 8

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
      return NextResponse.json({ residents: [], announcements: [] })
    }

    const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''
    if (q.length < 2) {
      return NextResponse.json({ residents: [], announcements: [] })
    }

    const estateId = resident.estateId
    const canSearchMembers = ['ADMIN', 'SUPER_ADMIN', 'SECURITY'].includes(resident.role)

    const contains = { contains: q, mode: 'insensitive' as const }

    const [announcements, members] = await Promise.all([
      prisma.announcement.findMany({
        where: {
          estateId,
          OR: [{ title: contains }, { body: contains }],
        },
        orderBy: { createdAt: 'desc' },
        take: LIMIT,
        select: { id: true, title: true },
      }),
      canSearchMembers
        ? prisma.resident.findMany({
            where: {
              estateId,
              OR: [
                { firstName: contains },
                { lastName: contains },
                { email: contains },
                { phone: contains },
              ],
            },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            take: LIMIT,
            select: { id: true, firstName: true, lastName: true, email: true },
          })
        : Promise.resolve([]),
    ])

    return NextResponse.json({
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        href: '/announcements',
      })),
      residents: members.map((r) => ({
        id: r.id,
        label: `${r.firstName} ${r.lastName}`.trim(),
        sub: r.email,
        href: '/residents',
      })),
    })
  } catch (err) {
    logger.error('[GET /api/dashboard/search]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
