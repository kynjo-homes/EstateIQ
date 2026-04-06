'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useResident } from '@/context/ResidentContext'
import { ChevronRight } from 'lucide-react'
import ChangePasswordForm from './ChangePasswordForm'

interface Props {
  hasPassword: boolean
}

export default function SettingsClient({ hasPassword }: Props) {
  const { data: session, status } = useSession()
  const { loading, isAdmin } = useResident()

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg animate-pulse space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          <p className="mt-1 text-sm text-gray-500">
            Signed in as{' '}
            <span className="font-medium text-gray-800">{session?.user?.email ?? '—'}</span>
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Password</h2>
          <p className="mt-1 text-sm text-gray-500">
            Use a strong password you do not reuse on other sites.
          </p>

          {hasPassword && (
            <div className="mt-4">
              <ChangePasswordForm />
            </div>
          )}

          {!hasPassword && (
            <p className="mt-4 text-sm text-gray-600">
              Your account does not use an email password (for example, you may sign in with Google).
              To set a password for email sign-in, use{' '}
              <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
                forgot password
              </Link>{' '}
              from the same email—we will send you a link to create one.
            </p>
          )}
        </section>

        {isAdmin && (
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <h3 className="border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-900">
              Estate & billing
            </h3>
            <Link
              href="/subscription"
              className="flex items-center justify-between gap-3 px-6 py-4 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span>Subscription & plan</span>
              <ChevronRight size={18} className="shrink-0 text-gray-400" />
            </Link>
          </section>
        )}

        <p className="text-center text-xs text-gray-400">
          Notification and other preferences will appear here when available.
        </p>
      </div>
    </div>
  )
}
