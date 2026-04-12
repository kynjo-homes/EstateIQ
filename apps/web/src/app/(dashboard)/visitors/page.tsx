import { Suspense } from 'react'
import Topbar from '@/components/layout/Topbar'
import VisitorsClient from './VisitorsClient'

export default function VisitorsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Visitors & Gate" />
      <Suspense
        fallback={
          <div className="flex-1 overflow-y-auto p-6">
            <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
          </div>
        }
      >
        <VisitorsClient />
      </Suspense>
    </div>
  )
}