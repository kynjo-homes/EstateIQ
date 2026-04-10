'use client'
import { useResident } from '@/context/ResidentContext'
import Topbar from '@/components/layout/Topbar'
import ResidentsClient from './ResidentsClient'
import { ShieldCheck } from 'lucide-react'

export default function ResidentsPage() {
  const { canViewMembers, loading } = useResident()

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Topbar title="Members" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!canViewMembers) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Topbar title="Members" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <ShieldCheck size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">Access restricted</p>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            Only estate administrators and security staff can open the member directory.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Members" />
      <ResidentsClient />
    </div>
  )
}