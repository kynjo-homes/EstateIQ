import { NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth-request'
import { destroyCloudinaryAssets, isCloudinaryUrlOwnedByApp } from '@/lib/cloudinaryServer'
import { logger } from '@/lib/logger'

const MAX_URLS = 20

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const urls = body?.urls as unknown
    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: 'urls array required' }, { status: 400 })
    }
    if (urls.length > MAX_URLS) {
      return NextResponse.json({ error: `Maximum ${MAX_URLS} URLs per request` }, { status: 400 })
    }

    const stringUrls = urls.filter((u): u is string => typeof u === 'string' && u.length > 0)
    for (const url of stringUrls) {
      if (!isCloudinaryUrlOwnedByApp(url)) {
        return NextResponse.json({ error: 'Invalid or foreign URL' }, { status: 400 })
      }
    }

    await destroyCloudinaryAssets(stringUrls)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('[POST /api/upload/delete]', { message, stack: err instanceof Error ? err.stack : undefined })
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
