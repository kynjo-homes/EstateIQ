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
    <div className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
      showExpired
        ? 'bg-red-600 text-white'
        : 'bg-amber-500 text-white'
    }`}>
      <AlertTriangle size={15} className="shrink-0" />
      <p className="flex-1">
        {showExpired
          ? 'Your Professional subscription has expired. Some features are now locked.'
          : `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
        }
      </p>
      <Link
        href="/subscribe"
        className="flex items-center gap-1 font-semibold underline hover:no-underline shrink-0"
      >
        Renew now <ArrowRight size={13} />
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded hover:opacity-70 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}