/**
 * Server-side Turnstile verification.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export type TurnstileVerifyResult = {
  ok: boolean
  /** Cloudflare `error-codes` when ok is false */
  errorCodes?: string[]
}

export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !token?.trim()) {
    return { ok: false, errorCodes: ['missing-secret-or-token'] }
  }

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

  if (!res.ok) {
    return { ok: false, errorCodes: [`http-${res.status}`] }
  }

  const data = (await res.json()) as {
    success?: boolean
    'error-codes'?: string[]
  }

  if (data.success === true) {
    return { ok: true }
  }

  return {
    ok: false,
    errorCodes: data['error-codes']?.length ? data['error-codes'] : ['unknown'],
  }
}

/**
 * Enforce verification only when both server secret and public site key exist.
 */
export function isTurnstileEnforced(): boolean {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  return Boolean(secret && siteKey)
}
