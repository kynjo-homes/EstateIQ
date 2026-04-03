'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'kynjo.cookie-consent'

type CookiePreferences = {
  essential: true
  analytics: boolean
  marketing: boolean
}

type StoredConsent = {
  v: 1
  at: number
  choice: 'accepted' | 'rejected' | 'custom'
  preferences: CookiePreferences
}

function persist(data: StoredConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const prefsPanelId = useId()

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      if (localStorage.getItem(STORAGE_KEY)) return
      setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function dismissWith(data: StoredConsent) {
    persist(data)
    setVisible(false)
    setPrefsOpen(false)
  }

  function acceptAll() {
    dismissWith({
      v: 1,
      at: Date.now(),
      choice: 'accepted',
      preferences: { essential: true, analytics: true, marketing: true },
    })
  }

  function rejectNonEssential() {
    setAnalytics(false)
    setMarketing(false)
    dismissWith({
      v: 1,
      at: Date.now(),
      choice: 'rejected',
      preferences: { essential: true, analytics: false, marketing: false },
    })
  }

  function saveCustomPreferences() {
    dismissWith({
      v: 1,
      at: Date.now(),
      choice: 'custom',
      preferences: { essential: true, analytics, marketing },
    })
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-live="polite"
    >
      <div className="max-w-4xl mx-auto pointer-events-auto bg-card border border-border rounded-xl shadow-lg p-4 md:p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <p id="cookie-consent-title" className="text-sm text-muted-foreground flex-1 min-w-0">
            We use cookies to run the site (for example sign-in), and optional cookies for
            analytics and communications where you allow them. Essential cookies cannot be turned off.
            See our{' '}
            <Link href="/cookies" className="text-primary underline underline-offset-2">
              Cookie Policy
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 shrink-0 lg:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-center sm:justify-start"
              aria-expanded={prefsOpen}
              aria-controls={prefsPanelId}
              onClick={() => setPrefsOpen((o) => !o)}
            >
              Cookie preferences
              {prefsOpen ? (
                <ChevronUp className="size-4" aria-hidden />
              ) : (
                <ChevronDown className="size-4" aria-hidden />
              )}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={rejectNonEssential}>
              Reject
            </Button>
            <Button type="button" size="sm" onClick={acceptAll}>
              Accept all
            </Button>
          </div>
        </div>

        {prefsOpen ? (
          <div
            id={prefsPanelId}
            className="border-t border-border pt-4 space-y-4"
            role="region"
            aria-label="Cookie categories"
          >
            <p className="text-xs text-muted-foreground">
              Choose which optional cookies we may use. Essential cookies are always active.
            </p>

            <ul className="space-y-3">
              <li className="rounded-lg border border-border bg-muted/30 px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Essential</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for security, sign-in, and remembering your consent. Always on.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground shrink-0">Always on</span>
                </div>
              </li>

              <li className="rounded-lg border border-border px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <label htmlFor="cookie-analytics" className="text-sm font-medium text-foreground">
                      Analytics
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Helps us understand how the product is used so we can improve it.
                    </p>
                  </div>
                  <input
                    id="cookie-analytics"
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-1 size-4 rounded border-input accent-primary shrink-0"
                  />
                </div>
              </li>

              <li className="rounded-lg border border-border px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <label htmlFor="cookie-marketing" className="text-sm font-medium text-foreground">
                      Marketing
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used to measure campaigns and show relevant updates where applicable.
                    </p>
                  </div>
                  <input
                    id="cookie-marketing"
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-1 size-4 rounded border-input accent-primary shrink-0"
                  />
                </div>
              </li>
            </ul>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setPrefsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={saveCustomPreferences}>
                Save preferences
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
