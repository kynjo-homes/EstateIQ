import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  const email = session?.user?.email
  if (!userId || !email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { estateName, slug, address, firstName, lastName, phone, unitNumber, unitBlock, plan } =
    await req.json()

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
      { status: 400 }
    )
  }

  // Check slug is not taken
  const existing = await prisma.estate.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'That estate URL is already taken' }, { status: 409 })
  }

  try {
    // Run everything in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the estate
      const estate = await tx.estate.create({
        data: { name: estateName, slug, address, plan: plan ?? 'STARTER', subscriptionStatus: plan === 'PROFESSIONAL' ? 'PENDING_PAYMENT' : 'ACTIVE', },
      })

      // 2. Create the first unit
      const unit = await tx.unit.create({
        data: { estateId: estate.id, number: unitNumber, block: unitBlock || null },
      })

      // 3. Create the admin resident profile
      const resident = await tx.resident.create({
        data: {
          estateId: estate.id,
          userId,
          unitId: unit.id,
          role: 'ADMIN',
          firstName,
          lastName,
          email,
          phone: phone || null,
        },
      })

      return { estate, unit, resident }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/onboarding]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}