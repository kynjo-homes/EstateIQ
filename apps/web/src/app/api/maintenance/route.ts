import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident) return NextResponse.json([])

    // Admins see all requests; residents see only their own
    const where = ['ADMIN', 'SUPER_ADMIN'].includes(resident.role)
      ? { estateId: resident.estateId }
      : { estateId: resident.estateId, submittedBy: resident.id }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests)
  } catch (err) {
    logger.error('[GET /api/maintenance]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId },
    })
    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    const { title, description, category, priority, mediaUrls } = await req.json()

    if (!title?.trim() || !description?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: 'Title, description and category are required' },
        { status: 400 }
      )
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        estateId:    resident.estateId,
        title:       title.trim(),
        description: description.trim(),
        category:    category.trim(),
        priority:    priority ?? 'MEDIUM',
        status:      'OPEN',
        submittedBy: resident.id,
        mediaUrls:   mediaUrls ?? [],
      },
    })

    return NextResponse.json(request, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/maintenance]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}