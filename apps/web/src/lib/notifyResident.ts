import { prisma } from '@estateiq/database'
import { sendToResident } from '@/lib/sseStore'

export async function notifyResident(
  residentId: string,
  data: {
    type: string
    title: string
    body?: string | null
    href?: string | null
  }
) {
  const n = await prisma.inAppNotification.create({
    data: {
      residentId,
      type: data.type,
      title: data.title,
      body: data.body ?? null,
      href: data.href ?? null,
    },
  })
  sendToResident(residentId, 'notification', {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href,
    createdAt: n.createdAt.toISOString(),
  })
  return n
}
