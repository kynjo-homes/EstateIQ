'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, Megaphone, ShieldCheck, CreditCard, CheckCheck, Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchJson } from '@/lib/fetchJson'

type Item = {
  id: string
  type: string
  title: string
  body: string | null
  href: string | null
  readAt: string | null
  createdAt: string
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  })
}

function typeIcon(type: string) {
  if (type.startsWith('VISITOR')) return ShieldCheck
  if (type === 'ANNOUNCEMENT') return Megaphone
  if (type === 'PAYMENT_APPROVED') return CreditCard
  return Bell
}

export default function NotificationsClient() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await fetchJson<{ items: Item[]; unreadCount: number }>(
      '/api/notifications?limit=200'
    )
    if (data) {
      setItems(data.items)
      setUnreadCount(data.unreadCount)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function markRead(ids: string[]) {
    if (!ids.length) return
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids }),
    })
    void load()
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ markAllRead: true }),
    })
    void load()
  }

  const visible =
    filter === 'unread' ? items.filter((i) => !i.readAt) : items

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
            <p className="mt-1 text-sm text-gray-500">
              Updates from your estate — visitors, announcements, and payments.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <CheckCheck size={16} className="text-brand-600" />
              Mark all read
            </button>
          )}
        </div>

        <div className="mt-8 flex gap-2 border-b border-gray-200">
          {(
            [
              { id: 'all' as const, label: 'All' },
              { id: 'unread' as const, label: 'Unread' },
            ]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                filter === t.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              )}
            >
              {t.label}
              {t.id === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <ul className="mt-6 space-y-3">
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </>
          )}

          {!loading && visible.length === 0 && (
            <li className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center">
              <Inbox className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                {filter === 'unread' ? "You're all caught up." : 'No notifications yet.'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                When something happens — visitors at the gate, new announcements, payment
                updates — it will show up here.
              </p>
            </li>
          )}

          {!loading &&
            visible.map((n) => {
              const Icon = typeIcon(n.type)
              const unread = !n.readAt
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    disabled={!n.href}
                    onClick={() => {
                      if (!n.href) return
                      if (unread) void markRead([n.id])
                      router.push(n.href)
                    }}
                    className={cn(
                      'flex w-full gap-4 rounded-2xl border p-4 text-left transition-all',
                      unread
                        ? 'border-brand-200 bg-white shadow-sm ring-1 ring-brand-100'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm',
                      !n.href && 'cursor-default opacity-80'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                        unread ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-500'
                      )}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm text-gray-900',
                            unread ? 'font-semibold' : 'font-medium'
                          )}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {formatWhen(n.createdAt)}
                        </span>
                      </div>
                      {n.body && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{n.body}</p>
                      )}
                      {n.href && (
                        <p className="mt-2 text-xs font-medium text-brand-600">
                          Open related page →
                        </p>
                      )}
                    </div>
                    {unread && (
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500"
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              )
            })}
        </ul>
      </div>
    </div>
  )
}
