'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Unexpected error</h1>
      <p className="text-gray-400 text-sm mb-6 max-w-sm">{error.message}</p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
      >
        <RefreshCw size={14} /> Reload
      </button>
    </div>
  )
}