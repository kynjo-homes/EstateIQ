/**
 * Server-side Turnstile verification.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !token?.trim()) return false

  const body = new URLSearchParams({ secret, response: token.trim() })
  if (remoteip) body.set('remoteip', remoteip)

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }
  )

  if (!res.ok) return false

  const data = (await res.json()) as { success?: boolean }
  return data.success === true
}

/**
 * Enforce verification only when both server secret and public site key exist.
 * If Netlify has TURNSTILE_SECRET_KEY but the build lacks NEXT_PUBLIC_TURNSTILE_SITE_KEY,
 * the widget never renders while authorize() rejects every login — works on localhost
 * where both are often unset together.
 */
export function isTurnstileEnforced(): boolean {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  return Boolean(secret && siteKey)
}
