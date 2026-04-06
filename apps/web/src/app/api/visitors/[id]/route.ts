import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId: session.user.id },
    })
    if (!resident) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const existing = await prisma.visitor.findFirst({
      where: { id, estateId: resident.estateId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { status } = await req.json()
    const isStaff = ['ADMIN', 'SUPER_ADMIN', 'SECURITY'].includes(resident.role)
    const isOwner = existing.residentId === resident.id

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!isStaff && isOwner && status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Residents may only cancel their own visitor registrations' },
        { status: 403 }
      )
    }

    const visitor = await prisma.visitor.update({
      where: { id, estateId: resident.estateId },
      data: { status },
    })

    return NextResponse.json(visitor)
  } catch (err: any) {
    logger.error('[PATCH /api/visitors/:id]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}