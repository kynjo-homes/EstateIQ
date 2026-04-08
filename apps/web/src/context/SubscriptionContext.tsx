'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchJson } from '@/lib/fetchJson'
import { PlanId, PlanLimits, getEffectivePlanLimits, canAccessFeature } from '@/lib/plans'

interface SubscriptionInfo {
  plan:                  PlanId
  subscriptionStatus:    string
  subscriptionExpiresAt: string | null
  subscriptionStartedAt: string | null
}

interface SubscriptionContextType {
  plan:       PlanId
  status:     string
  expiresAt:  Date | null
  limits:     PlanLimits
  isActive:   boolean
  daysLeft:   number | null
  can:        (feature: keyof PlanLimits) => boolean
  loading:    boolean
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan:      'STARTER',
  status:    'ACTIVE',
  expiresAt: null,
  limits:    getEffectivePlanLimits('STARTER', 'ACTIVE', null),
  isActive:  true,
  daysLeft:  null,
  can:       () => false,
  loading:   true,
})

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [info, setInfo]     = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJson<SubscriptionInfo>('/api/subscription/me')
      .then(({ data }) => { if (data) setInfo(data) })
      .finally(() => setLoading(false))
  }, [])

  const plan      = (info?.plan ?? 'STARTER') as PlanId
  const status    = info?.subscriptionStatus ?? 'ACTIVE'
  const expiresAt = info?.subscriptionExpiresAt ? new Date(info.subscriptionExpiresAt) : null
  const limits    = getEffectivePlanLimits(plan, status, expiresAt)

  const isActive = status === 'ACTIVE' && (
    plan === 'STARTER' ? true :
    expiresAt ? expiresAt > new Date() : false
  )

  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86400000))
    : null

  function can(feature: keyof PlanLimits): boolean {
    return canAccessFeature(plan, isActive ? 'ACTIVE' : 'EXPIRED', feature)
  }

  return (
    <SubscriptionContext.Provider value={{
      plan, status, expiresAt, limits, isActive, daysLeft, can, loading,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)