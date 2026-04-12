import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'
import { notifyResident } from '@/lib/notifyResident'

export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params
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

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        levy: { estateId: resident.estateId },
      },
      include: {
        levy: { select: { title: true, currency: true } },
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

    const currency = payment.levy.currency ?? 'NGN'
    await notifyResident(payment.residentId, {
      type: 'PAYMENT_APPROVED',
      title: 'Levy payment approved',
      body: `${payment.levy.title}: ${currency} ${payment.amount.toLocaleString()}`,
      href: '/levies',
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
