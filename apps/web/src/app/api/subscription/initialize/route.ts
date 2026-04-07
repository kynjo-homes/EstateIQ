import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { PLAN_PRICE_KOBO } from '@/lib/plans'

/** Paystack rejects initialize when email is missing/invalid (JSON omits `undefined`). */
function pickCustomerEmail(
  ...candidates: (string | null | undefined)[]
): string | null {
  for (const raw of candidates) {
    if (typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (!trimmed || !trimmed.includes('@')) continue
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) continue
    return trimmed
  }
  return null
}

export async function POST() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where:   { userId },
      include: { estate: true },
    })

    if (!resident || !['ADMIN', 'SUPER_ADMIN'].includes(resident.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const authUser = await prisma.authUser.findUnique({
      where: { id: userId },
    })

    const customerEmail = pickCustomerEmail(authUser?.email, resident.email)
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No valid email on your account. Update your profile or contact support.' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:    customerEmail,
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

    return NextResponse.json({
      url:            data.data.authorization_url,
      accessCode:     data.data.access_code as string,
      /** Required by Paystack Inline `setup()` alongside `access_code` (popup validates these). */
      customerEmail,
      amountKobo:     PLAN_PRICE_KOBO,
    })
  } catch (err: any) {
    console.error('[POST /api/subscription/initialize]', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}