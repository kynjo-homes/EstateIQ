import { Suspense } from 'react'
import Topbar from '@/components/layout/Topbar'
import LeviesClient from './LeviesClient'
import SubscriptionGate from '@/components/SubscriptionGate'

export default function LeviesPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Levies & Dues" />
      <SubscriptionGate feature="levies">
        <Suspense
          fallback={
            <div className="flex-1 overflow-y-auto p-6">
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            </div>
          }
        >
          <LeviesClient />
        </Suspense>
      </SubscriptionGate>
    </div>
  )
}