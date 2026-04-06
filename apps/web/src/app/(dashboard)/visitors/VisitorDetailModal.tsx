'use client'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Visitor } from './VisitorsClient'

interface Props {
  visitor: Visitor
  onClose: () => void
}

function formatWhen(iso: string | null, opts: Intl.DateTimeFormatOptions) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-NG', opts)
}

export default function VisitorDetailModal({ visitor: v, onClose }: Props) {
  const unit =
    v.resident.unit != null
      ? `${v.resident.unit.block ? v.resident.unit.block + ', ' : ''}${v.resident.unit.number}`
      : '—'

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Visitor details</h2>
            <p className="text-sm text-gray-500 mt-0.5">{v.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="space-y-3">
            <Detail label="Status" value={v.status.charAt(0) + v.status.slice(1).toLowerCase()} />
            <Detail label="Purpose" value={v.purpose ?? '—'} />
            <Detail label="Phone" value={v.phone ?? '—'} />
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Access code</p>
              <p className="mt-1 bg-gray-900 text-white text-xl font-mono font-bold px-3 py-2 rounded-lg tracking-widest inline-block">
                {v.accessCode}
              </p>
            </div>
            <Detail
              label="Host"
              value={`${v.resident.firstName} ${v.resident.lastName}`}
            />
            <Detail label="Unit" value={unit} />
            <Detail
              label="Expected arrival"
              value={formatWhen(v.expectedAt, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            <Detail
              label="Arrived"
              value={formatWhen(v.arrivedAt, {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            <Detail
              label="Exited"
              value={formatWhen(v.exitedAt, {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            <Detail
              label="Registered"
              value={formatWhen(v.createdAt, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            <Detail label="Visitor ID" value={v.id} mono />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={cn('mt-1 text-gray-900', mono && 'font-mono text-xs break-all')}>{value}</p>
    </div>
  )
}
