import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId: session.user.id },
    })
    if (!resident) return NextResponse.json([])

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(resident.role)

    const polls = await prisma.poll.findMany({
      where: { estateId: resident.estateId },
      include: {
        votes: {
          select: {
            optionIndex: true,
            residentId: true,
            resident: {
              select: {
                firstName: true,
                lastName:  true,
                unit:      { select: { number: true, block: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Attach vote counts and whether current resident has voted
    const enriched = polls.map(poll => {
      const voteCounts = poll.options.map((_, i) =>
        poll.votes.filter(v => v.optionIndex === i).length
      )
      const totalVotes = poll.votes.length
      const hasVoted   = poll.votes.some(v => v.residentId === resident.id)
      const myVote     = poll.votes.find(v => v.residentId === resident.id)?.optionIndex ?? null
      const isExpired  = new Date(poll.endsAt) < new Date()

      const base = {
        ...poll,
        votes: undefined,
        voteCounts,
        totalVotes,
        hasVoted,
        myVote,
        isExpired,
      }

      if (!isAdmin) {
        return base
      }

      const voters = [...poll.votes]
        .map(v => ({
          residentId:  v.residentId,
          firstName:   v.resident.firstName,
          lastName:    v.resident.lastName,
          optionIndex: v.optionIndex,
          optionLabel: poll.options[v.optionIndex] ?? '',
          unit:        v.resident.unit
            ? { number: v.resident.unit.number, block: v.resident.unit.block }
            : null,
        }))
        .sort((a, b) => {
          const an = `${a.lastName} ${a.firstName}`.toLowerCase()
          const bn = `${b.lastName} ${b.firstName}`.toLowerCase()
          return an.localeCompare(bn)
        })

      return { ...base, voters }
    })

    return NextResponse.json(enriched)
  } catch (err) {
    logger.error('[GET /api/polls]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
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

    const { question, options, endsAt, isAnonymous } = await req.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const cleanOptions = (options as string[])?.map((o: string) => o.trim()).filter(Boolean)
    if (!cleanOptions || cleanOptions.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      )
    }

    if (!endsAt || new Date(endsAt) <= new Date()) {
      return NextResponse.json(
        { error: 'End date must be in the future' },
        { status: 400 }
      )
    }

    const poll = await prisma.poll.create({
      data: {
        estateId:    resident.estateId,
        question:    question.trim(),
        options:     cleanOptions,
        endsAt:      new Date(endsAt),
        isAnonymous: isAnonymous ?? false,
      },
    })

    return NextResponse.json(poll, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/polls]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}