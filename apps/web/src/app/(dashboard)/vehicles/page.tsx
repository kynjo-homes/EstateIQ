import Topbar from '@/components/layout/Topbar'
import VehiclesClient from './VehiclesClient'
import SubscriptionGate from '@/components/SubscriptionGate'

export default function VehiclesPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Vehicles & Stickers" />
      <SubscriptionGate feature="vehicleQR">
        <VehiclesClient />
      </SubscriptionGate>
    </div>
  )
}