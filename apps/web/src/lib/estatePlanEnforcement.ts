import { prisma } from '@estateiq/database'
import type { Prisma, PrismaClient } from '@estateiq/database'
import { PlanId, getEffectivePlanLimits } from '@/lib/plans'

export type DbClient = PrismaClient | Prisma.TransactionClient

export async function assertCanAddUnit(
  db: DbClient,
  estateId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const estate = await db.estate.findUnique({
    where: { id: estateId },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionExpiresAt: true,
    },
  })
  if (!estate) {
    return { ok: false, message: 'Estate not found' }
  }
  const limits = getEffectivePlanLimits(
    estate.plan as PlanId,
    estate.subscriptionStatus,
    estate.subscriptionExpiresAt
  )
  if (limits.maxUnits === -1) {
    return { ok: true }
  }
  const count = await db.unit.count({ where: { estateId } })
  if (count >= limits.maxUnits) {
    return {
      ok: false,
      message: `Your plan allows up to ${limits.maxUnits} units. Upgrade to Professional to add more.`,
    }
  }
  return { ok: true }
}

export async function assertCanAddResident(
  db: DbClient,
  estateId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const estate = await db.estate.findUnique({
    where: { id: estateId },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionExpiresAt: true,
    },
  })
  if (!estate) {
    return { ok: false, message: 'Estate not found' }
  }
  const limits = getEffectivePlanLimits(
    estate.plan as PlanId,
    estate.subscriptionStatus,
    estate.subscriptionExpiresAt
  )
  if (limits.maxResidents === -1) {
    return { ok: true }
  }
  const count = await db.resident.count({ where: { estateId } })
  if (count >= limits.maxResidents) {
    return {
      ok: false,
      message: `Your plan allows up to ${limits.maxResidents} residents. Upgrade to Professional to add more.`,
    }
  }
  return { ok: true }
}
