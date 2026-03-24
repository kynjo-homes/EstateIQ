'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { fetchJson } from '@/lib/fetchJson'
import ResetPasswordClient from './ResetPasswordClient'

export default function ResetPasswordPage() {
  const searchParams          = useSearchParams()
  const router                = useRouter()
  const token                 = searchParams.get('token')

  const [email, setEmail]         = useState('')
  const [tokenError, setTokenError] = useState('')
  const [validating, setValidating] = useState(true)
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenError('No reset token found in this link.')
      setValidating(false)
      return
    }

    fetchJson<{ valid: boolean; email: string }>(
      `/api/auth/reset-password?token=${token}`
    ).then(({ data, error }) => {
      setValidating(false)
      if (error) { setTokenError(error); return }
      setEmail(data?.email ?? '')
    })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await fetchJson('/api/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, password }),
    })

    setLoading(false)

    if (error) { setError(error); return }
    setDone(true)
    setTimeout(() => router.push('/sign-in'), 3000)
  }

  function strength(pw: string) {
    if (pw.length === 0) return null
    if (pw.length < 6)  return { label: 'Too short', color: 'bg-red-400',   width: '25%'  }
    if (pw.length < 8)  return { label: 'Weak',      color: 'bg-amber-400', width: '50%'  }
    if (pw.length < 12) return { label: 'Good',      color: 'bg-blue-500',  width: '75%'  }
    return                     { label: 'Strong',    color: 'bg-green-500', width: '100%' }
  }

  const pwStrength = strength(password)

  return (
    <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 rounded-2xl mb-4">
            <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
              <path d="M28 4L50 17V39L28 52L6 39V17L28 4Z"
                fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round"/>
              <circle cx="28" cy="28" r="7" fill="#fff"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Set new password</h1>
          {email && (
            <p className="text-gray-500 text-sm mt-1">for {email}</p>
          )}
        </div>

        {/* Validating */}
        {validating && (
          <div className="text-center py-6">
            <Loader2 size={24} className="animate-spin text-green-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Validating reset link...</p>
          </div>
        )}

        {/* Token error */}
        {!validating && tokenError && (
          <div className="text-center space-y-4">
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              {tokenError}
            </div>
            <Link
              href="/forgot-password"
              className="inline-block text-sm text-green-600 hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        )}

        {/* Success */}
        {done && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Password updated!</h2>
            <p className="text-sm text-gray-500">
              Your password has been changed. Redirecting you to sign in...
            </p>
          </div>
        )}

        {/* Form */}
        {!validating && !tokenError && !done && (
          <>
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoFocus
                    placeholder="At least 8 characters"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {pwStrength && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pwStrength.color}`}
                        style={{ width: pwStrength.width }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{pwStrength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat your new password"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    confirm && confirm !== password
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirm || password !== confirm}
                className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> Updating password...</>
                  : 'Update password'
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
     }>
     <ResetPasswordClient />
   </Suspense>
  )
}