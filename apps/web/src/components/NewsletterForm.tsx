'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type NewsletterFormProps = {
  variant?: 'default' | 'footer'
  /** Where the signup happened — defaults from variant (footer → footer, else contact). */
  source?: 'footer' | 'contact'
}

export default function NewsletterForm({ variant = 'default', source: sourceProp }: NewsletterFormProps) {
  const source = sourceProp ?? (variant === 'footer' ? 'footer' : 'contact')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const isFooter = variant === 'footer'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Could not subscribe. Try again later.')
        return
      }
      setDone(true)
      setEmail('')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <p className={`text-sm ${isFooter ? 'text-muted-foreground' : 'text-green-700'}`}>
        Thanks — you are on the list. We will only send product news and updates.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={isFooter ? 'space-y-3' : 'space-y-4'}>
      <div>
        <h3
          className={
            isFooter
              ? 'font-sans text-sm font-semibold text-foreground mb-1'
              : 'text-base font-semibold text-gray-900 mb-1'
          }
        >
          Newsletter
        </h3>
        <p
          className={
            isFooter ? 'text-xs text-muted-foreground mb-3' : 'text-sm text-gray-600 mb-3'
          }
        >
          Product updates and estate-management tips. Unsubscribe any time.
        </p>
        <div className={`flex flex-col ${isFooter ? 'gap-2 sm:flex-row' : 'gap-2 sm:flex-row'}`}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className={
              isFooter
                ? 'flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                : 'flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/30'
            }
          />
          <Button type="submit" disabled={loading} className={isFooter ? 'shrink-0' : 'bg-green-600 hover:bg-green-700 text-white shrink-0'}>
            {loading ? '…' : 'Subscribe'}
          </Button>
        </div>
      </div>
      {error ? (
        <p className={`text-xs ${isFooter ? 'text-destructive' : 'text-red-600'}`}>{error}</p>
      ) : null}
    </form>
  )
}
