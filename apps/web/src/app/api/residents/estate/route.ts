import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, Prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

function prismaUserMessage(err: unknown): string | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2022' || err.message.includes('does not exist')) {
      return 'Database is missing levy banking columns. Deploy the latest migration (e.g. npx prisma migrate deploy from packages/database).'
    }
  }
  return null
}

export async function GET() {
  try {
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

    const [estate, residentCount] = await Promise.all([
      prisma.estate.findUnique({
        where: { id: resident.estateId },
        select: {
          id:                 true,
          name:               true,
          duesBankName:       true,
          duesAccountNumber:  true,
        },
      }),
      prisma.resident.count({
        where: { estateId: resident.estateId, isActive: true },
      }),
    ])

    if (!estate) {
      return NextResponse.json({ error: 'Estate not found' }, { status: 404 })
    }

    return NextResponse.json({ estate, residentCount })
  } catch (err) {
    logger.error('[GET /api/residents/estate]', {
      message: err instanceof Error ? err.message : String(err),
      stack:   err instanceof Error ? err.stack : undefined,
    })
    const hint = prismaUserMessage(err)
    return NextResponse.json(
      { error: hint ?? (process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Internal server error') },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
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

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected a JSON object' }, { status: 400 })
    }
    const record = body as Record<string, unknown>
    const data: { duesBankName?: string | null; duesAccountNumber?: string | null } = {}
    if (Object.prototype.hasOwnProperty.call(record, 'duesBankName')) {
      data.duesBankName = typeof record.duesBankName === 'string' ? record.duesBankName.trim() || null : null
    }
    if (Object.prototype.hasOwnProperty.call(record, 'duesAccountNumber')) {
      data.duesAccountNumber =
        typeof record.duesAccountNumber === 'string' ? record.duesAccountNumber.trim() || null : null
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const estate = await prisma.estate.update({
      where: { id: resident.estateId },
      data,
      select: {
        id:                 true,
        name:               true,
        duesBankName:       true,
        duesAccountNumber:  true,
      },
    })

    return NextResponse.json({ estate })
  } catch (err) {
    logger.error('[PATCH /api/residents/estate]', {
      message: err instanceof Error ? err.message : String(err),
      stack:   err instanceof Error ? err.stack : undefined,
    })
    const hint = prismaUserMessage(err)
    return NextResponse.json(
      { error: hint ?? (process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Internal server error') },
      { status: 500 }
    )
  }
}
