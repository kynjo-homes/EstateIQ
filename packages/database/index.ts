import { readFileSync } from 'node:fs'

import { PrismaClient } from './src/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const GLOBAL_DB_URL_KEY = '__ESTATEIQ_DATABASE_URL__' as const

/**
 * On Linux serverless (Netlify/AWS), the real process environment is still in
 * `/proc/self/environ` even when Next.js/webpack replaces `process.env` in the bundle.
 */
function readDatabaseUrlFromLinuxProc(): string | undefined {
  if (typeof process === 'undefined' || process.platform === 'win32') return undefined
  try {
    const raw = readFileSync('/proc/self/environ', 'utf8')
    for (const entry of raw.split('\0')) {
      if (entry.startsWith('DATABASE_URL=')) {
        const v = entry.slice('DATABASE_URL='.length)
        if (v.trim().length > 0) return v.trim()
      }
    }
  } catch {
    // Not Linux or unreadable
  }
  return undefined
}

/**
 * Next.js may inline `process.env.DATABASE_URL` at build time as `undefined`, which makes
 * Prisma fall back to `localhost:5432`. Read order: instrumentation global → Linux proc → env.
 */
function readDatabaseUrlFromEnv(): string | undefined {
  const g = globalThis as unknown as Record<string, string | undefined>
  const fromGlobal = g[GLOBAL_DB_URL_KEY]
  if (typeof fromGlobal === 'string' && fromGlobal.trim().length > 0) {
    return fromGlobal.trim()
  }

  const fromProc = readDatabaseUrlFromLinuxProc()
  if (fromProc) return fromProc

  const reflect = Reflect.get(process.env, 'DATABASE_URL')
  if (typeof reflect === 'string' && reflect.trim().length > 0) return reflect.trim()

  const dyn = process.env['DATABASE' + '_' + 'URL'] as string | undefined
  if (typeof dyn === 'string' && dyn.trim().length > 0) return dyn.trim()

  return undefined
}

/**
 * Railway / many cloud Postgres hosts require TLS when connecting from outside their network
 * (e.g. Netlify Functions). Append sslmode=require if not already present.
 */
function resolveDatabaseUrl(): string | undefined {
  const url = readDatabaseUrlFromEnv()
  if (!url) return undefined
  if (/[?&]sslmode=/.test(url)) return url
  if (url.includes('rlwy.net') || url.includes('railway.app')) {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}sslmode=require`
  }
  return url
}

function prismaClientOptions(): ConstructorParameters<typeof PrismaClient>[0] {
  const resolved = resolveDatabaseUrl()
  const base: ConstructorParameters<typeof PrismaClient>[0] = {
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  }
  // Never pass `url: undefined` — it overrides schema env("DATABASE_URL") and breaks the client.
  if (resolved) {
    base.datasources = { db: { url: resolved } }
  }
  return base
}

const prismaClient =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions())

/** For health checks / diagnostics — whether a non-empty DATABASE_URL is visible at runtime. */
export function isDatabaseUrlConfigured(): boolean {
  return Boolean(readDatabaseUrlFromEnv())
}

/** True if DATABASE_URL points at this machine (wrong for Netlify — use hosted DB URL). */
export function isDatabaseUrlLocalhost(): boolean {
  const u = readDatabaseUrlFromEnv()
  if (!u) return false
  return /localhost|127\.0\.0\.1/i.test(u)
}

// One client per serverless instance (warm container); same pattern as dev HMR.
globalForPrisma.prisma = prismaClient

export const prisma = prismaClient

export * from './src/generated/prisma'