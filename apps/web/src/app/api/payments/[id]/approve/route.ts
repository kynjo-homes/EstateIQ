import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId: session.user.id },
    })
    if (!resident || !['ADMIN', 'SUPER_ADMIN'].includes(resident.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        levy: { estateId: resident.estateId },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending payments can be approved' }, { status: 400 })
    }
    if (!payment.receiptUrl) {
      return NextResponse.json({ error: 'No receipt uploaded for this payment' }, { status: 400 })
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('[PATCH /api/payments/:id/approve]', {
      message: err instanceof Error ? err.message : String(err),
      stack:   err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
