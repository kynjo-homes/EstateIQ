import Topbar from '@/components/layout/Topbar'
import ProfileClient from './ProfileClient'

export default function ProfilePage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Topbar title="My profile" />
      <ProfileClient />
    </div>
  )
}
