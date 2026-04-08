'use server'

import {
  authenticateCredentials,
  setWebSessionCookie,
} from '@/lib/credentials-login'
import { logger } from '@/lib/logger'

export type LoginState = { error: string } | { success: true } | null

/**
 * Email/password login: JWT in httpOnly cookie.
 * Returns `{ success: true }` so the client can navigate — do not use `redirect()` here;
 * Next.js 16 can mis-classify the redirect error and surface a generic failure in production.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const turnstileToken = formData.get('turnstileToken')?.toString().trim() ?? ''

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  try {
    const result = await authenticateCredentials(
      email,
      password,
      turnstileToken || undefined
    )

    if ('error' in result) {
      return { error: result.error }
    }

    await setWebSessionCookie(result.user)
    return { success: true }
  } catch (error) {
    logger.error('[loginAction]', error)
    return { error: 'Unable to sign in. Please try again.' }
  }
}
