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

    const incidents = await prisma.securityIncident.findMany({
      where: { estateId: resident.estateId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(incidents)
  } catch (err: any) {
    logger.error('[GET /api/incidents]', { message: err.message, stack: err.stack })
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

    const { title, description, severity, location } = await req.json()

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const incident = await prisma.securityIncident.create({
      data: {
        estateId:    resident.estateId,
        title:       title.trim(),
        description: description.trim(),
        severity:    severity  ?? 'LOW',
        location:    location?.trim() || null,
        mediaUrls:   [],
        reportedBy:  resident.id,
      },
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (err: any) {
    logger.error('[POST /api/incidents]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}