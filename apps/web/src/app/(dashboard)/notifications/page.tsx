import Topbar from '@/components/layout/Topbar'
import NotificationsClient from './NotificationsClient'

export default function NotificationsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Topbar title="Notifications" />
      <NotificationsClient />
    </div>
  )
}
