const required = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXTAUTH_URL',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'PAYSTACK_SECRET_KEY',
    'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  ]
  
  const optional = [
    'SMTP_PORT',
    'SMTP_SECURE',
    'PAYSTACK_WEBHOOK_SECRET',
  ]
  
  export function validateEnv() {
    const missing = required.filter(key => !process.env[key])
  
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nAdd them to your .env.local file.`
      )
    }
  
    if (process.env.NODE_ENV === 'production') {
      const weakSecret = process.env.AUTH_SECRET?.length ?? 0
      if (weakSecret < 32) {
        throw new Error('AUTH_SECRET must be at least 32 characters in production.')
      }
    }
  
    console.log('[Env] All required environment variables present')
  }