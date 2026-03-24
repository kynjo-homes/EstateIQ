'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react'
import { fetchJson } from '@/lib/fetchJson'

export default function SubscribePage() {
  const router                  = useRouter()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')

    const { data, error } = await fetchJson<{ url: string }>(
      '/api/subscription/initialize',
      { method: 'POST' }
    )

    setLoading(false)

    if (error) { setError(error); return }
    if (data?.url) window.location.href = data.url
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-green-600 px-6 py-8 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard size={24} className="text-white" />
          </div>
          <h1 className="text-white font-bold text-2xl">Activate Professional</h1>
          <p className="text-green-100 text-sm mt-1">
            One payment, full access for 12 months
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Professional plan</p>
              <p className="text-xs text-gray-400 mt-0.5">12-month subscription</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 text-lg">₦150,000</p>
              <p className="text-xs text-gray-400">billed annually</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {[
              'Unlimited residents and units',
              'Levies & Paystack payment collection',
              'Polls and community voting',
              'Vehicle QR gate system',
              'Facility booking and management',
              'Priority email support',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Redirecting to Paystack...</>
              : <><ShieldCheck size={15} /> Pay ₦150,000 securely</>
            }
          </button>

          {/* Skip for now */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Continue with Starter plan for now
          </button>

          <p className="text-center text-xs text-gray-400">
            Payments secured by Paystack. No card stored on EstateIQ.
          </p>
        </div>
      </div>
    </div>
  )
}