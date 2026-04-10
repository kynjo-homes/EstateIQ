'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardToastPayload = {
  message: string
  variant: 'success' | 'error'
}

interface Props {
  toast: DashboardToastPayload | null
  onDismiss: () => void
  /** ms before auto-dismiss; 0 = no auto-dismiss */
  durationMs?: number
}

export default function DashboardToast({
  toast,
  onDismiss,
  durationMs = 4500,
}: Props) {
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    if (!toast || durationMs <= 0) return
    const t = window.setTimeout(() => dismissRef.current(), durationMs)
    return () => window.clearTimeout(t)
  }, [toast, durationMs])

  if (!toast || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[120] max-w-sm w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-2 duration-200"
      role="status"
    >
      <div
        className={cn(
          'rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3',
          toast.variant === 'success'
            ? 'bg-white border-gray-100 text-gray-900'
            : 'bg-white border-red-100 text-gray-900'
        )}
      >
        <div className="shrink-0 mt-0.5">
          {toast.variant === 'success' ? (
            <CheckCircle className="text-green-600" size={20} strokeWidth={2} />
          ) : (
            <AlertCircle className="text-red-600" size={20} strokeWidth={2} />
          )}
        </div>
        <p className="text-sm leading-relaxed flex-1 pt-0.5">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  )
}
