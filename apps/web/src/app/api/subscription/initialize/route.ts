import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { PLAN_PRICE_KOBO } from '@/lib/plans'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where:   { userId: session.user.id },
      include: { estate: true },
    })

    if (!resident || !['ADMIN', 'SUPER_ADMIN'].includes(resident.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const authUser = await prisma.authUser.findUnique({
      where: { id: session.user.id },
    })

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:    authUser?.email,
        amount:   PLAN_PRICE_KOBO,
        currency: 'NGN',
        metadata: {
          estateId:  resident.estateId,
          estateName: resident.estate.name,
          plan:       'PROFESSIONAL',
          type:       'subscription',
        },
        callback_url: `${process.env.NEXTAUTH_URL}/subscribe/success`,
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json(
        { error: data.message ?? 'Payment initialization failed' },
        { status: 400 }
      )
    }

    // Mark estate as pending payment
    await prisma.estate.update({
      where: { id: resident.estateId },
      data: {
        plan:              'PROFESSIONAL',
        subscriptionStatus: 'PENDING_PAYMENT',
        paystackReference:  data.data.reference,
      },
    })

    return NextResponse.json({ url: data.data.authorization_url })
  } catch (err: any) {
    console.error('[POST /api/subscription/initialize]', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}