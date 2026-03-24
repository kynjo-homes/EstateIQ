import Topbar from '@/components/layout/Topbar'
import FacilitiesClient from './FacilitiesClient'
import SubscriptionGate from '@/components/SubscriptionGate'

export default function FacilitiesPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Facilities" />
      <SubscriptionGate feature="facilities">
        <FacilitiesClient />
      </SubscriptionGate>
    </div>
  )
}