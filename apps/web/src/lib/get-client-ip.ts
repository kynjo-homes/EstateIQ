type HeaderBag = Pick<Headers, 'get'>

/**
 * Best-effort client IP for Turnstile `remoteip` (Netlify / proxies set x-forwarded-for).
 */
export function getClientIpFromHeaders(headers: HeaderBag): string | undefined {
  const xf = headers.get('x-forwarded-for')
  if (xf) {
    const first = xf.split(',')[0]?.trim()
    if (first) return first
  }
  const real = headers.get('x-real-ip')?.trim()
  if (real) return real
  return undefined
}

export function getClientIpFromRequest(req: Request): string | undefined {
  return getClientIpFromHeaders(req.headers)
}
