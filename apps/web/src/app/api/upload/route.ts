import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { cloudinary } from '@/lib/cloudinaryServer'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file     = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const onlyImages = formData.get('onlyImages') === 'true'
    if (onlyImages && file.type && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // 5MB max
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const folder =
      formData.get('folder') === 'maintenance'
        ? 'estateiq/maintenance'
        : formData.get('folder') === 'levies'
          ? 'estateiq/levies'
          : 'estateiq'

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'auto',
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err: any) {
    logger.error('[POST /api/upload]', { message: err.message, stack: err.stack })
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}