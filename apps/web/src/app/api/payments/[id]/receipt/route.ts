import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function POST(
  req: Request,
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
    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    const { receiptUrl } = await req.json()
    if (!receiptUrl || typeof receiptUrl !== 'string' || !receiptUrl.trim()) {
      return NextResponse.json({ error: 'Receipt URL is required' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, residentId: resident.id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending payments can be updated' }, { status: 400 })
    }
    if (payment.receiptUrl) {
      return NextResponse.json({ error: 'Receipt already submitted' }, { status: 400 })
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { receiptUrl: receiptUrl.trim() },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('[POST /api/payments/:id/receipt]', {
      message: err instanceof Error ? err.message : String(err),
      stack:   err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
