import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const security = await prisma.resident.findUnique({
      where: { userId: session.user.id },
    })
    if (!security || !['SECURITY', 'ADMIN', 'SUPER_ADMIN'].includes(security.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let body: { visitorId?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const key = body.visitorId?.trim()
    if (!key) {
      return NextResponse.json({ error: 'visitorId is required' }, { status: 400 })
    }

    // Gate staff usually paste the 6-digit access code (shown on cards), not the DB id.
    const existing = await prisma.visitor.findFirst({
      where: {
        estateId: security.estateId,
        OR:       [{ id: key }, { accessCode: key }],
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'No visitor found with that ID or access code.' },
        { status: 404 }
      )
    }

    const visitor = await prisma.visitor.update({
      where: { id: existing.id },
      data:  { status: 'EXITED', exitedAt: new Date() },
    })

    return NextResponse.json(visitor)
  } catch (err) {
    logger.error('[POST /api/visitors/checkout]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}