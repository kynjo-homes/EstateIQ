import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter — no external service needed
const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  req: NextRequest,
  options: { limit: number; windowMs: number }
) {
  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const key = `${req.nextUrl.pathname}:${ip}`
  const now = Date.now()

  const record = requests.get(key)

  if (!record || now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + options.windowMs })
    return null
  }

  if (record.count >= options.limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)),
          'X-RateLimit-Limit':     String(options.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  record.count++
  return null
}