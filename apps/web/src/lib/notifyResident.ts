import { prisma } from '@estateiq/database'
import { sendToResident } from '@/lib/sseStore'
import { buildNotificationHref } from '@/lib/notificationDeepLink'

export async function notifyResident(
  residentId: string,
  data: {
    type: string
    title: string
    body?: string | null
    /** Dashboard path, e.g. `/visitors` (deep link query is appended). */
    basePath: string
    focus?: { kind: string; id: string } | null
  }
) {
  const n = await prisma.inAppNotification.create({
    data: {
      residentId,
      type: data.type,
      title: data.title,
      body: data.body ?? null,
      href: null,
    },
  })
  const href = buildNotificationHref(data.basePath, {
    notificationId: n.id,
    focus: data.focus ?? null,
  })
  const updated = await prisma.inAppNotification.update({
    where: { id: n.id },
    data: { href },
  })
  sendToResident(residentId, 'notification', {
    id: updated.id,
    type: updated.type,
    title: updated.title,
    body: updated.body,
    href: updated.href,
    createdAt: updated.createdAt.toISOString(),
  })
  return updated
}
