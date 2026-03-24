import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@estateiq/database'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resident = await prisma.resident.findUnique({
      where: { userId: session.user.id },
    })

    console.log('=== DASHBOARD STATS DEBUG ===')
    console.log('Session user ID:', session.user.id)
    console.log('Resident found:', resident ? 'yes' : 'no')
    console.log('Resident role:', resident?.role)
    console.log('Estate ID:', resident?.estateId)
    console.log('=============================')

    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    const estateId = resident.estateId

    const [
      totalResidents,
      activeResidents,
      totalUnits,
      occupiedUnits,
      levies,
      payments,
      pendingMaintenance,
      openIncidents,
      visitorsToday,
      activePolls,
      recentAnnouncements,
      recentMaintenance,
      recentVisitors,
    ] = await Promise.all([
      prisma.resident.count({
        where: { estateId },
      }),
      prisma.resident.count({
        where: { estateId, isActive: true },
      }),
      prisma.unit.count({
        where: { estateId },
      }),
      prisma.unit.count({
        where: { estateId, residents: { some: { isActive: true } } },
      }),
      prisma.levy.findMany({
        where: { estateId },
        select: { id: true, amount: true },
      }),
      prisma.payment.findMany({
        where: { levy: { estateId } },
        select: { status: true, amount: true },
      }),
      prisma.maintenanceRequest.count({
        where: { estateId, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } },
      }),
      prisma.securityIncident.count({
        where: { estateId, resolvedAt: null },
      }),
      prisma.visitor.count({
        where: {
          estateId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.poll.count({
        where: {
          estateId,
          endsAt: { gt: new Date() },
        },
      }),
      prisma.announcement.findMany({
        where:   { estateId },
        orderBy: { createdAt: 'desc' },
        take:    3,
        select:  { id: true, title: true, createdAt: true },
      }),
      prisma.maintenanceRequest.findMany({
        where:   { estateId },
        orderBy: { createdAt: 'desc' },
        take:    3,
        select:  { id: true, title: true, createdAt: true, status: true },
      }),
      prisma.visitor.findMany({
        where:   { estateId },
        orderBy: { createdAt: 'desc' },
        take:    3,
        select:  { id: true, name: true, createdAt: true, status: true },
      }),
    ])

    console.log('=== QUERY RESULTS ===')
    console.log('Total residents:', totalResidents)
    console.log('Total units:', totalUnits)
    console.log('Levies count:', levies.length)
    console.log('Payments count:', payments.length)
    console.log('Visitors today:', visitorsToday)
    console.log('====================')

    const totalLevies      = levies.length
    const paidPayments     = payments.filter(p => p.status === 'PAID')
    const totalCollected   = paidPayments.reduce((s, p) => s + p.amount, 0)
    const totalExpected    = payments.reduce((s, p) => s + p.amount, 0)
    const totalOutstanding = totalExpected - totalCollected
    const collectionRate   = totalExpected > 0
      ? Math.round((totalCollected / totalExpected) * 100)
      : 0

    const recentActivity = [
      ...recentAnnouncements.map(a => ({
        id:        a.id,
        type:      'announcement',
        message:   `New announcement: ${a.title}`,
        createdAt: a.createdAt.toISOString(),
      })),
      ...recentMaintenance.map(m => ({
        id:        m.id,
        type:      'maintenance',
        message:   `Maintenance request: ${m.title} — ${m.status.toLowerCase()}`,
        createdAt: m.createdAt.toISOString(),
      })),
      ...recentVisitors.map(v => ({
        id:        v.id,
        type:      'visitor',
        message:   `Visitor ${v.name} — ${v.status.toLowerCase()}`,
        createdAt: v.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)

    return NextResponse.json({
      totalResidents,
      activeResidents,
      totalUnits,
      occupiedUnits,
      totalLevies,
      totalCollected,
      totalOutstanding,
      collectionRate,
      pendingMaintenance,
      openIncidents,
      visitorsToday,
      activePolls,
      recentActivity,
    })
  } catch (err: any) {
    console.error('[GET /api/dashboard/stats]', err.message, err.stack)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}