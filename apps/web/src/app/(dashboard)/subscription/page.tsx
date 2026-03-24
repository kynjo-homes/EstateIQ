'use client'
import { useSubscription } from '@/context/SubscriptionContext'
import Topbar from '@/components/layout/Topbar'
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function SubscriptionPage() {
  const { plan, status, expiresAt, isActive, daysLeft, limits } = useSubscription()

  const statusConfig = {
    ACTIVE:          { label: 'Active',          color: 'bg-green-50 text-green-700', icon: CheckCircle2 },
    EXPIRED:         { label: 'Expired',         color: 'bg-red-50   text-red-700',   icon: AlertTriangle },
    CANCELLED:       { label: 'Cancelled',       color: 'bg-gray-100 text-gray-600',  icon: AlertTriangle },
    PENDING_PAYMENT: { label: 'Pending payment', color: 'bg-amber-50 text-amber-700', icon: Clock        },
  }

  const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.ACTIVE
  const StatusIcon = cfg.icon

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Subscription" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-2xl">

        {/* Current plan card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {plan.charAt(0) + plan.slice(1).toLowerCase()} plan
                </h2>
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1', cfg.color)}>
                  <StatusIcon size={11} />
                  {cfg.label}
                </span>
              </div>
              {expiresAt && (
                <p className="text-sm text-gray-500">
                  {isActive
                    ? `Renews on ${expiresAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : `Expired on ${expiresAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  }
                </p>
              )}
              {daysLeft !== null && isActive && daysLeft <= 30 && (
                <p className="text-sm text-amber-600 mt-1 font-medium">
                  {daysLeft} days remaining
                </p>
              )}
            </div>

            {plan !== 'CUSTOM' && (
              <Link
                href="/subscribe"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shrink-0"
              >
                <CreditCard size={14} />
                {plan === 'STARTER' ? 'Upgrade' : 'Renew'}
              </Link>
            )}
          </div>
        </div>

        {/* Feature access */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Feature access</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Residents',         limit: limits.maxResidents === -1 ? 'Unlimited' : `Up to ${limits.maxResidents}` },
              { label: 'Units',             limit: limits.maxUnits      === -1 ? 'Unlimited' : `Up to ${limits.maxUnits}`      },
              { label: 'Levies & payments', limit: limits.levies          ? 'Included' : 'Not included' },
              { label: 'Polls & voting',    limit: limits.polls           ? 'Included' : 'Not included' },
              { label: 'Vehicle QR system', limit: limits.vehicleQR       ? 'Included' : 'Not included' },
              { label: 'Facility booking',  limit: limits.facilities      ? 'Included' : 'Not included' },
            ].map(({ label, limit }) => (
              <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={cn(
                  'text-xs font-medium',
                  limit === 'Not included' ? 'text-gray-300' : 'text-green-600'
                )}>
                  {limit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA for Starter */}
        {plan === 'STARTER' && (
          <div className="bg-green-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-1">Unlock the full platform</h3>
            <p className="text-green-100 text-sm mb-4">
              Upgrade to Professional for ₦150,000/year and get unlimited residents, levies, polls, vehicle QR, and facility booking.
            </p>
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 bg-white text-green-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors"
            >
              Upgrade now <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}