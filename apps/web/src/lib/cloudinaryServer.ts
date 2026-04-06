import { v2 as cloudinary } from 'cloudinary'
import { logger } from '@/lib/logger'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

/**
 * Extract Cloudinary public_id from a delivery URL (handles version + transformation segments).
 */
export function publicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('cloudinary.com')) return null
    const parts = u.pathname.split('/upload/')
    if (parts.length < 2) return null
    let segments = parts[1].split('/').filter(Boolean)
    while (segments.length && segments[0].includes(',')) {
      segments.shift()
    }
    if (segments.length && /^v\d+$/i.test(segments[0])) {
      segments.shift()
    }
    const rest = segments.join('/')
    const lastDot = rest.lastIndexOf('.')
    if (lastDot > 0) {
      const ext = rest.slice(lastDot + 1).toLowerCase()
      if (/^[a-z0-9]{2,5}$/.test(ext)) {
        return rest.slice(0, lastDot)
      }
    }
    return rest || null
  } catch {
    return null
  }
}

export function isCloudinaryUrlOwnedByApp(url: string): boolean {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloud) return false
  try {
    const u = new URL(url)
    if (!u.hostname.includes('cloudinary.com')) return false
    const first = u.pathname.split('/').filter(Boolean)[0]
    return first === cloud
  } catch {
    return false
  }
}

export async function destroyCloudinaryAssets(urls: string[]): Promise<void> {
  for (const url of urls) {
    if (!url || !isCloudinaryUrlOwnedByApp(url)) continue
    const pid = publicIdFromCloudinaryUrl(url)
    if (!pid) {
      logger.warn('[cloudinary] could not parse public id', { url })
      continue
    }
    try {
      await cloudinary.uploader.destroy(pid, { resource_type: 'image' })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      logger.warn('[cloudinary] destroy failed', { pid, message })
    }
  }
}
