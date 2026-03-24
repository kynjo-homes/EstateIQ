'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import logo from '@/components/images/logo2.png'
import { useSearchParams } from 'next/navigation'

export default function SignUpForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'STARTER'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      setError('You must agree to the Terms of Service and Privacy Policy to continue.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, consent: true, plan }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    await signIn('credentials', {
      email: form.email,
      password: form.password,
      callbackUrl: '/onboarding',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="mb-6">
          <div className="flex justify-center mb-3">
            <Image
              src={logo}
              alt="EstateIQ"
              height={66}
              width={231}
              className="h-[66px] w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Get your estate on EstateIQ in minutes</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['name', 'email', 'password'] as const).map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field}
              </label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}

          <div className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
            />
            <label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
              I have read and agree to the{' '}
              <Link href="/terms" target="_blank" className="text-green-600 hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="text-green-600 hover:underline font-medium">
                Privacy Policy
              </Link>
              , including the collection and processing of my personal data.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !consent}
            className="w-full bg-green-600 text-white rounded py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-green-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
