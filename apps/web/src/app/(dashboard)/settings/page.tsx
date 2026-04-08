import Topbar from '@/components/layout/Topbar'
import SettingsClient from './SettingsClient'
import { auth } from '@/lib/session'
import { prisma } from '@estateiq/database'

export default async function SettingsPage() {
  const session = await auth()
  const user =
    session?.user?.id != null
      ? await prisma.authUser.findUnique({
          where: { id: session.user.id },
          select: { passwordHash: true },
        })
      : null
  const hasPassword = user?.passwordHash != null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Topbar title="Settings" />
      <SettingsClient hasPassword={hasPassword} />
    </div>
  )
}
