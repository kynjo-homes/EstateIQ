import { NextResponse } from 'next/server'

const allowedOrigins = [
  process.env.NEXTAUTH_URL!,
  'https://your-production-domain.com',
]

export function withCors(response: NextResponse, req: Request): NextResponse {
  const origin = req.headers.get('origin') ?? ''

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin',  origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mobile-session')
    response.headers.set('Access-Control-Max-Age',       '86400')
  }

  return response
}