import { NextResponse } from 'next/server'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const estate = await prisma.estate.findUnique({
      where: { slug },
      select: {
        id:      true,
        name:    true,
        slug:    true,
        address: true,
        plan:    true,
        _count: {
          select: {
            residents: { where: { isActive: true } },
            units:     true,
          },
        },
      },
    })

    if (!estate) {
      return NextResponse.json({ error: 'Estate not found' }, { status: 404 })
    }

    return NextResponse.json(estate)
  } catch (err: any) {
    logger.error('[GET /api/estate/:slug]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}