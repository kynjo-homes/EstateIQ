'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchJson } from '@/lib/fetchJson'
import SubscriptionGate from '@/components/SubscriptionGate'
import logo from '@/components/images/logo.png'

type Outcome = 'GRANTED' | 'WARNING' | 'BLOCKED'

interface ScanResult {
  outcome:  Outcome
  vehicle:  { plateNumber: string; make: string | null; model: string | null; color: string | null }
  resident: { name: string; unit: string }
  estate:   string
  debt:     { amount: number; formatted: string; invoices: number }
  message:  string
}

const OUTCOME_CONFIG: Record<Outcome, { bg: string; icon: any; title: string }> = {
  GRANTED: { bg: 'bg-green-600',  icon: CheckCircle2, title: 'Access granted' },
  WARNING: { bg: 'bg-amber-500',  icon: AlertTriangle,title: 'Access — debt warning' },
  BLOCKED: { bg: 'bg-red-600',    icon: XCircle,      title: 'Access restricted' },
}

export default function GateScanPage() {
  const [token, setToken]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<ScanResult | null>(null)
  const [error, setError]     = useState('')

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const { data, error } = await fetchJson<ScanResult>(
      `/api/scan/vehicle?token=${token.trim()}`
    )

    setLoading(false)
    if (error) { setError(error); return }
    setResult(data)
  }

  function reset() {
    setToken('')
    setResult(null)
    setError('')
  }

  // Auto-reset after 10 seconds
  useEffect(() => {
    if (!result) return
    const t = setTimeout(reset, 10000)
    return () => clearTimeout(t)
  }, [result])

  return (
    <SubscriptionGate feature="vehicleQR">
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <Image
            src={logo}
            alt="EstateIQ"
            height={64}
            width={224}
            className="h-16 w-auto object-contain"
          />
        </div>
        <h1 className="text-white font-bold text-2xl">Security Checkpoint</h1>
        <p className="text-gray-400 text-sm mt-1">Vehicle access terminal</p>
      </div>

      {/* Result display */}
      {result && (
        <div className={cn(
          'w-full max-w-md rounded-2xl p-6 mb-6 text-white',
          OUTCOME_CONFIG[result.outcome].bg
        )}>
          <div className="flex items-center gap-3 mb-4">
            {(() => { const Icon = OUTCOME_CONFIG[result.outcome].icon; return <Icon size={28} /> })()}
            <h2 className="text-xl font-bold">{OUTCOME_CONFIG[result.outcome].title}</h2>
          </div>
          <div className="space-y-1.5 text-sm opacity-90">
            <p><span className="opacity-70">Plate:</span> <span className="font-mono font-bold">{result.vehicle.plateNumber}</span></p>
            <p><span className="opacity-70">Vehicle:</span> {[result.vehicle.color, result.vehicle.make, result.vehicle.model].filter(Boolean).join(' ') || 'No details'}</p>
            <p><span className="opacity-70">Resident:</span> {result.resident.name}</p>
            <p><span className="opacity-70">Unit:</span> {result.resident.unit}</p>
            {result.debt.amount > 0 && (
              <p className="mt-3 font-semibold">
                Outstanding dues: {result.debt.formatted}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs opacity-60">Auto-resets in 10s</p>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors">
              <RotateCcw size={12} /> Reset now
            </button>
          </div>
        </div>
      )}

      {/* Input form */}
      {!result && (
        <form onSubmit={handleScan} className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 text-center">
              Enter or scan vehicle token
            </label>
            <input
              type="text"
              value={token}
              onChange={e => { setToken(e.target.value); setError('') }}
              placeholder="Vehicle QR token"
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-4 text-white text-center text-lg font-mono focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!token.trim() || loading}
            className="w-full bg-green-600 text-white rounded py-4 text-lg font-semibold hover:bg-green-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Checking...</> : 'Verify vehicle'}
          </button>
        </form>
      )}

      <p className="text-gray-600 text-xs mt-8">
        EstateIQ · Vehicle Access Control
      </p>
    </div>
    </SubscriptionGate>
  )
}