'use client'
import { ReactNode } from 'react'
import { useSubscription } from '@/context/SubscriptionContext'
import { PlanLimits } from '@/lib/plans'
import { Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Props {
  feature:  keyof PlanLimits
  children: ReactNode
  fallback?: ReactNode
}

export default function SubscriptionGate({ feature, children, fallback }: Props) {
  const { can, loading } = useSubscription()

  if (loading) return null

  if (!can(feature)) {
    return fallback ?? (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <Lock size={22} className="text-amber-500" />
        </div>
        <h2 className="font-semibold text-gray-900 mb-2">
          Professional feature
        </h2>
        <p className="text-gray-400 text-sm max-w-xs mb-5">
          This feature is available on the Professional plan. Upgrade to unlock it for your estate.
        </p>
        <Link
          href="/subscribe"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          Upgrade to Professional <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return <>{children}</>
}