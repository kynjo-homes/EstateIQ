import { NextResponse } from 'next/server'
import {
  prisma,
  Prisma,
  isDatabaseUrlConfigured,
  isDatabaseUrlLocalhost,
} from '@estateiq/database'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const start = Date.now()

    try {
      await prisma.$queryRawUnsafe('SELECT 1')
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      const prismaInit =
        err instanceof Prisma.PrismaClientInitializationError ? err : null

      let hint: string | undefined
      try {
        if (!isDatabaseUrlConfigured()) {
          hint =
            'DATABASE_URL is not visible at runtime. Set DATABASE_URL in Netlify for Builds and Functions, then redeploy.'
        } else if (isDatabaseUrlLocalhost()) {
          hint =
            'DATABASE_URL points at localhost. Use your hosted Postgres URL in Netlify, not a local connection string.'
        }
      } catch {
        hint = undefined
      }

      return NextResponse.json(
        {
          status:    'degraded',
          timestamp: new Date().toISOString(),
          database: {
            status: 'disconnected',
            error:  message,
            ...(prismaInit?.errorCode && { prismaErrorCode: prismaInit.errorCode }),
            ...(hint && { hint }),
          },
        },
        { status: 503 }
      )
    }
  } catch (fatal: unknown) {
    const msg = fatal instanceof Error ? fatal.message : String(fatal)
    return NextResponse.json(
      {
        status:    'error',
        timestamp: new Date().toISOString(),
        message:   msg,
      },
      { status: 500 }
    )
  }
}