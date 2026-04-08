import { NextResponse } from 'next/server'
import { clearWebSessionCookie } from '@/lib/credentials-login'

export async function POST() {
  await clearWebSessionCookie()
  return NextResponse.json({ ok: true })
}
