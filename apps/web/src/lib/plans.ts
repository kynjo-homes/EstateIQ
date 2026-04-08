export type PlanId = 'STARTER' | 'PROFESSIONAL' | 'CUSTOM'

export interface PlanLimits {
  maxResidents:    number   // -1 = unlimited
  maxUnits:        number   // -1 = unlimited
  levies:          boolean
  polls:           boolean
  vehicleQR:       boolean
  facilities:      boolean
  prioritySupport: boolean
}

export const PLANS: Record<PlanId, PlanLimits> = {
  STARTER: {
    maxResidents:    20,
    maxUnits:        10,
    levies:          false,
    polls:           false,
    vehicleQR:       false,
    facilities:      false,
    prioritySupport: false,
  },
  PROFESSIONAL: {
    maxResidents:    -1,
    maxUnits:        -1,
    levies:          true,
    polls:           true,
    vehicleQR:       true,
    facilities:      true,
    prioritySupport: true,
  },
  CUSTOM: {
    maxResidents:    -1,
    maxUnits:        -1,
    levies:          true,
    polls:           true,
    vehicleQR:       true,
    facilities:      true,
    prioritySupport: true,
  },
}

export const PLAN_PRICE_KOBO = 15_000_000 // ₦150,000 in kobo for Paystack

export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLANS[plan]
}

/**
 * Limits used for caps (units/residents) and feature gates when payment or subscription
 * state means the estate should not get paid-tier capacity.
 */
export function getEffectivePlanLimits(
  plan: PlanId,
  subscriptionStatus: string,
  subscriptionExpiresAt: Date | null
): PlanLimits {
  if (subscriptionStatus === 'PENDING_PAYMENT') {
    return PLANS.STARTER
  }
  if (subscriptionStatus === 'EXPIRED' || subscriptionStatus === 'CANCELLED') {
    return PLANS.STARTER
  }
  if (plan === 'STARTER') {
    return PLANS.STARTER
  }
  if (subscriptionStatus !== 'ACTIVE') {
    return PLANS.STARTER
  }
  if (plan === 'PROFESSIONAL' || plan === 'CUSTOM') {
    if (isSubscriptionActive('ACTIVE', subscriptionExpiresAt)) {
      return PLANS[plan]
    }
    return PLANS.STARTER
  }
  return PLANS.STARTER
}

export function canAccessFeature(
  plan: PlanId,
  status: string,
  feature: keyof PlanLimits
): boolean {
  if (status === 'EXPIRED' || status === 'CANCELLED') {
    // Expired accounts get read-only Starter access
    return PLANS.STARTER[feature] as boolean
  }
  return PLANS[plan][feature] as boolean
}

export function isSubscriptionActive(
  status: string,
  expiresAt: Date | null
): boolean {
  if (status === 'ACTIVE' && expiresAt) {
    return new Date(expiresAt) > new Date()
  }
  return status === 'ACTIVE'
}