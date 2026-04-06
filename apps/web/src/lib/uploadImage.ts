/**
 * Upload a file to Cloudinary via POST /api/upload (authenticated).
 */
export async function uploadImageFile(
  file: File,
  options?: { folder?: 'maintenance' | 'levies'; onlyImages?: boolean }
): Promise<{ url: string } | { error: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('onlyImages', options?.onlyImages === false ? 'false' : 'true')
  if (options?.folder === 'maintenance') {
    formData.append('folder', 'maintenance')
  }
  if (options?.folder === 'levies') {
    formData.append('folder', 'levies')
  }

  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const text = await res.text()
  let parsed: { url?: string; error?: string }
  try {
    parsed = JSON.parse(text)
  } catch {
    return { error: 'Invalid response from upload' }
  }
  if (!res.ok) {
    return { error: parsed?.error ?? `Upload failed (${res.status})` }
  }
  if (!parsed.url) {
    return { error: 'No URL returned' }
  }
  return { url: parsed.url }
}

/** Remove uploaded assets from Cloudinary (same account only; server-validated). */
export async function deleteUploadedUrls(
  urls: string[]
): Promise<{ ok: boolean; error?: string }> {
  if (urls.length === 0) return { ok: true }
  const res = await fetch('/api/upload/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  })
  let parsed: { error?: string } = {}
  try {
    parsed = await res.json()
  } catch {
    return { ok: false, error: 'Invalid response from server' }
  }
  if (!res.ok) {
    return { ok: false, error: parsed.error ?? `Failed (${res.status})` }
  }
  return { ok: true }
}
