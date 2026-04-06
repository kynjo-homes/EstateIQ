'use client'

import { useSession } from 'next-auth/react'
import { useResident } from '@/context/ResidentContext'

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN:       'Admin',
  SECURITY:    'Security',
  RESIDENT:    'Resident',
}

export default function ProfileClient() {
  const { data: session, status } = useSession()
  const { profile, loading } = useResident()

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg animate-pulse space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-3/4 rounded bg-gray-100" />
        </div>
      </div>
    )
  }

  const fullName =
    profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : session?.user?.name ?? '—'

  const roleLabel = profile?.role
    ? ROLE_LABEL[profile.role] ??
      profile.role.charAt(0) + profile.role.slice(1).toLowerCase()
    : '—'

  const unitLabel = profile?.unit
    ? [profile.unit.block, profile.unit.number].filter(Boolean).join(' · ')
    : '—'

  const rows: { label: string; value: string }[] = [
    { label: 'Full name', value: fullName },
    { label: 'Email', value: session?.user?.email ?? '—' },
    { label: 'Role', value: roleLabel },
    { label: 'Estate', value: profile?.estate?.name ?? '—' },
    { label: 'Unit', value: unitLabel },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        <p className="mt-1 text-sm text-gray-500">
          Your profile information from your estate account.
        </p>
        <dl className="mt-6 divide-y divide-gray-100">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 py-3 first:pt-0 sm:flex-row sm:justify-between">
              <dt className="text-sm font-medium text-gray-500">{label}</dt>
              <dd className="text-sm text-gray-900 sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
