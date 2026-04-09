import Topbar from '@/components/layout/Topbar'
import UnitsClient from './UnitsClient'

export default function UnitsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Units" />
      <UnitsClient />
    </div>
  )
}
