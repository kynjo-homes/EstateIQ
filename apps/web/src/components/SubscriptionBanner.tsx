'use client'
import { useSubscription } from '@/context/SubscriptionContext'
import { AlertTriangle, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SubscriptionBanner() {
  const { plan, isActive, daysLeft, status } = useSubscription()
  const [dismissed, setDismissed]            = useState(false)

  if (plan === 'STARTER' || plan === 'CUSTOM') return null
  if (dismissed) return null

  // Show banner when expired or within 7 days of expiry
  const showExpired  = status === 'EXPIRED'
  const showWarning  = isActive && daysLeft !== null && daysLeft <= 7

  if (!showExpired && !showWarning) return null

  return (
    <div
      className={`flex flex-col gap-3 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:gap-3 ${
        showExpired
          ? 'bg-red-600 text-white'
          : 'bg-amber-500 text-white'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 sm:mt-0" />
        <p className="min-w-0 flex-1 leading-snug">
          {showExpired
            ? 'Your Professional subscription has expired. Some features are now locked.'
            : `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
          }
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
        <Link
          href="/subscribe"
          className="flex items-center gap-1 font-semibold underline hover:no-underline"
        >
          Renew now <ArrowRight size={13} />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 hover:opacity-70"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}