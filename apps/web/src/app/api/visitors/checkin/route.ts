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
        { error: 'Only security staff can check in visitors' },
        { status: 403 }
      )
    }

    const { accessCode } = await req.json()
    if (!accessCode?.trim()) {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 })
    }

    const visitor = await prisma.visitor.findFirst({
      where: {
        accessCode: accessCode.trim(),
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
        { error: 'Invalid or expired access code. Visitor may have already checked in or been cancelled.' },
        { status: 404 }
      )
    }

    const updated = await prisma.visitor.update({
      where: { id: visitor.id },
      data:  { status: 'ARRIVED', arrivedAt: new Date() },
    })

    // Fire real-time SSE event directly to the resident's open connection
    sendToResident(visitor.residentId, 'visitor-arrived', {
      visitorName: visitor.name,
      purpose:     visitor.purpose,
      arrivedAt:   updated.arrivedAt,
      unit: visitor.resident.unit
        ? `${visitor.resident.unit.block ? visitor.resident.unit.block + ', ' : ''}${visitor.resident.unit.number}`
        : null,
    })

    await notifyResident(visitor.residentId, {
      type: 'VISITOR_ARRIVED',
      title: `${visitor.name} has arrived`,
      body: visitor.purpose ? `Purpose: ${visitor.purpose}` : null,
      href: '/visitors',
    })

    const unitLabel = visitor.resident.unit
      ? `${visitor.resident.unit.block ? visitor.resident.unit.block + ', ' : ''}${visitor.resident.unit.number}`
      : 'Unknown unit'

    // Flat shape — GateCheckinPanel / mobile gate read these keys on the JSON root
    return NextResponse.json({
      visitorName:  visitor.name,
      purpose:      visitor.purpose,
      residentName: `${visitor.resident.firstName} ${visitor.resident.lastName}`,
      unit:         unitLabel,
    })
  } catch (err) {
    logger.error('[POST /api/visitors/checkin]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}