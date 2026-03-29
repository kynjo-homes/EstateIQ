/**
 * Runs once per server cold start. Copies DATABASE_URL to globalThis so the DB package
 * can read it even when Next.js/webpack inlines `process.env.DATABASE_URL` as undefined.
 */
export function register() {
  const url = process.env.DATABASE_URL
  if (typeof url === 'string' && url.trim().length > 0) {
    ;(globalThis as unknown as { __ESTATEIQ_DATABASE_URL__?: string }).__ESTATEIQ_DATABASE_URL__ =
      url.trim()
  }
}
