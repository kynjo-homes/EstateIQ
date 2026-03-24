import { NextResponse } from 'next/server'
import { prisma } from '@estateiq/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  try {
    // Ping the database
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - start

    return NextResponse.json({
      status:    'ok',
      timestamp: new Date().toISOString(),
      version:   process.env.npm_package_version ?? '1.0.0',
      uptime:    process.uptime(),
      database: {
        status:  'connected',
        latency: `${dbLatency}ms`,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        status:    'degraded',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          error:  err.message,
        },
      },
      { status: 503 }
    )
  }
}