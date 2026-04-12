'use client'
import { useSession } from '@/components/layout/SessionProvider'
import { useResident } from '@/context/ResidentContext'
import MobileMenuButton from '@/components/layout/MobileMenuButton'
import UserMenu from '@/components/layout/UserMenu'
import DashboardSearch from '@/components/layout/DashboardSearch'
import TopbarNotifications from '@/components/layout/TopbarNotifications'

interface Props {
  title: string
}

export default function Topbar({ title }: Props) {
  const { data: session } = useSession()
  const { profile } = useResident()
  const displayTitle = profile?.estate?.name ? `${title} - ${profile.estate.name}` : title
  const initials = session?.user?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <MobileMenuButton />
        <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
          {displayTitle}
        </h1>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
        <DashboardSearch />
        <TopbarNotifications />
        <UserMenu initials={initials} />
      </div>
    </header>
  )
}
