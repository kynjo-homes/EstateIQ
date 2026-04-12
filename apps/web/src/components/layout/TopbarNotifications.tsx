'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { fetchJson } from '@/lib/fetchJson'
import { useSSE } from '@/hooks/useSSE'
import { cn } from '@/lib/utils'

type Item = {
  id: string
  type: string
  title: string
  body: string | null
  href: string | null
  readAt: string | null
  createdAt: string
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h}h ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function TopbarNotifications() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const { data } = await fetchJson<{ items: Item[]; unreadCount: number }>('/api/notifications')
    if (data) {
      setItems(data.items)
      setUnreadCount(data.unreadCount)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const id = setInterval(() => void load(), 45000)
    return () => clearInterval(id)
  }, [load])

  useSSE({
    notification: () => {
      void load()
    },
  })

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

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

  async function onItemClick(n: Item) {
    if (!n.readAt) await markRead([n.id])
    if (n.href) {
      router.push(n.href)
      setOpen(false)
    }
  }

  const badge = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o)
          void load()
        }}
        className="relative rounded p-2 text-gray-500 transition-colors hover:bg-gray-100"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute right-1 top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
            aria-hidden
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(100vw-1.5rem,22rem)] rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-[min(60vh,360px)] overflow-y-auto py-1">
            {items.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-gray-500">No notifications yet.</li>
            )}
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => void onItemClick(n)}
                  className={cn(
                    'flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50',
                    !n.readAt && 'bg-brand-50/50'
                  )}
                >
                  <span className={cn('text-gray-900', !n.readAt && 'font-medium')}>{n.title}</span>
                  {n.body && <span className="line-clamp-2 text-xs text-gray-600">{n.body}</span>}
                  <span className="text-[10px] text-gray-400">{formatRelative(n.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
