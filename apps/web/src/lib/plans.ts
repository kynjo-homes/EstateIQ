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