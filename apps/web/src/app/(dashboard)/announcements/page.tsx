import { Suspense } from 'react'
import Topbar from '@/components/layout/Topbar'
import AnnouncementsClient from './AnnouncementsClient'

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Announcements" />
      <Suspense
        fallback={
          <div className="flex-1 overflow-auto p-6">
            <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
          </div>
        }
      >
        <AnnouncementsClient />
      </Suspense>
    </div>
  )
}