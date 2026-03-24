import Topbar from '@/components/layout/Topbar'
import PollsClient from './PollsClient'
import SubscriptionGate from '@/components/SubscriptionGate'

export default function PollsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Polls & Voting" />
      <SubscriptionGate feature="polls">
        <PollsClient />
      </SubscriptionGate>
    </div>
  )
}