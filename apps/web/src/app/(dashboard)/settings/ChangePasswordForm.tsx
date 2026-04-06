'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { fetchJson } from '@/lib/fetchJson'
import { passwordMeetsPolicy, passwordRules } from '@/lib/passwordPolicy'

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword !== confirm) {
      setError('New password and confirmation do not match.')
      return
    }
    if (!passwordMeetsPolicy(newPassword)) {
      setError('Please meet all password requirements below.')
      return
    }

    setSubmitting(true)
    const { error: err } = await fetchJson<{ success?: boolean }>('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setSubmitting(false)

    if (err) {
      setError(err)
      return
    }

    setSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirm('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
          Your password has been updated.
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-gray-700">
          Current password
        </label>
        <div className="relative">
          <input
            id="current-password"
            type={showCurrent ? 'text' : 'password'}
            autoComplete="current-password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
            onClick={() => setShowCurrent(s => !s)}
            aria-label={showCurrent ? 'Hide password' : 'Show password'}
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-700">
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
            onClick={() => setShowNew(s => !s)}
            aria-label={showNew ? 'Hide password' : 'Show password'}
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <ul className="mt-2 space-y-1 text-xs text-gray-500">
          {passwordRules.map(rule => {
            const met = rule.test(newPassword)
            return (
              <li key={rule.id} className="flex items-center gap-1.5">
                <Check
                  size={14}
                  className={met ? 'text-green-600' : 'text-gray-300'}
                  aria-hidden
                />
                {rule.label}
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700">
          Confirm new password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
            onClick={() => setShowConfirm(s => !s)}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Updating…
          </>
        ) : (
          'Update password'
        )}
      </button>
    </form>
  )
}
