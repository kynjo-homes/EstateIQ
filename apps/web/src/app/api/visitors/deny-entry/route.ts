import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'
import { sendToResident } from '@/lib/sseStore'
import { notifyResident } from '@/lib/notifyResident'

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const security = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!security || !['SECURITY', 'ADMIN', 'SUPER_ADMIN'].includes(security.role)) {
      return NextResponse.json(
        { error: 'Only security staff can deny entry' },
        { status: 403 }
      )
    }

    let body: { accessCode?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const accessCode = body.accessCode?.trim()
    if (!accessCode) {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 })
    }

    const visitor = await prisma.visitor.findFirst({
      where: {
        accessCode,
        estateId:   security.estateId,
        status:     'EXPECTED',
      },
      include: {
        resident: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            unit: { select: { number: true, block: true } },
          },
        },
      },
    })

    if (!visitor) {
      return NextResponse.json(
        {
          error:
            'Invalid or expired access code. Visitor may have already checked in or been cancelled.',
        },
        { status: 404 }
      )
    }

    // Use raw SQL so this works even when the Next.js bundle has a stale generated Prisma
    // client that does not yet list DENIED in its embedded enum schema (would throw
    // PrismaClientValidationError). The database must still have the DENIED enum value
    // (run migration `20260406140000_visitor_status_denied`).
    await prisma.$executeRaw`
      UPDATE "Visitor"
      SET status = 'DENIED'::"VisitorStatus"
      WHERE id = ${visitor.id}
    `

    sendToResident(visitor.residentId, 'visitor-denied-at-gate', {
      visitorName: visitor.name,
      purpose:     visitor.purpose,
    })

    await notifyResident(visitor.residentId, {
      type: 'VISITOR_DENIED',
      title: `Entry denied for ${visitor.name}`,
      body: visitor.purpose ? `Stated purpose: ${visitor.purpose}` : null,
      basePath: '/visitors',
      focus: { kind: 'VISITOR', id: visitor.id },
    })

    const unitLabel = visitor.resident.unit
      ? `${visitor.resident.unit.block ? visitor.resident.unit.block + ', ' : ''}${visitor.resident.unit.number}`
      : 'Unknown unit'

    return NextResponse.json({
      visitorName:  visitor.name,
      purpose:      visitor.purpose,
      residentName: `${visitor.resident.firstName} ${visitor.resident.lastName}`,
      unit:         unitLabel,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('[POST /api/visitors/deny-entry]', {
      message: msg,
      stack:   err instanceof Error ? err.stack : undefined,
    })
    if (/invalid input value for enum|VisitorStatus|22P02/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            'Database is missing the DENIED visitor status. Apply migrations (e.g. prisma migrate deploy), then try again.',
        },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
