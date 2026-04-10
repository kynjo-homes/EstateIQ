'use client'

import { AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardConfirmVariant = 'danger' | 'primary'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: DashboardConfirmVariant
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DashboardConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-[110] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-confirm-title"
      onClick={() => {
        if (!loading) onCancel()
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex gap-3 min-w-0">
            <div
              className={cn(
                'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                variant === 'danger'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-brand-50 text-brand-700'
              )}
            >
              {variant === 'danger' ? (
                <AlertTriangle size={20} strokeWidth={2} />
              ) : (
                <Info size={20} strokeWidth={2} />
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 id="dashboard-confirm-title" className="font-semibold text-gray-900">
                {title}
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50/80 rounded-b-2xl">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 min-w-[7rem]',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-600 hover:bg-brand-700'
            )}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
