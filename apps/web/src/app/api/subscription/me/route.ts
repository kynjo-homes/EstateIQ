import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where:   { userId },
      include: { estate: {
        select: {
          plan:                  true,
          subscriptionStatus:    true,
          subscriptionExpiresAt: true,
          subscriptionStartedAt: true,
        },
      }},
    })

    if (!resident?.estate) {
      return NextResponse.json({ error: 'Estate not found' }, { status: 404 })
    }

    // Auto-expire subscriptions past their expiry date
    const estate = resident.estate
    if (
      estate.subscriptionStatus === 'ACTIVE' &&
      estate.subscriptionExpiresAt &&
      new Date(estate.subscriptionExpiresAt) < new Date()
    ) {
      await prisma.estate.update({
        where: { id: resident.estateId },
        data:  { subscriptionStatus: 'EXPIRED' },
      })
      estate.subscriptionStatus = 'EXPIRED'
    }

    return NextResponse.json({
      plan:                  estate.plan,
      subscriptionStatus:    estate.subscriptionStatus,
      subscriptionExpiresAt: estate.subscriptionExpiresAt,
      subscriptionStartedAt: estate.subscriptionStartedAt,
    })
  } catch (err: any) {
    console.error('[GET /api/subscription/me]', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}