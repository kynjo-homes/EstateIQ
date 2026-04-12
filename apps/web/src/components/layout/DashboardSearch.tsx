'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, LayoutGrid, Megaphone, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useResident } from '@/context/ResidentContext'
import {
  DASHBOARD_NAV_ITEMS,
  DASHBOARD_SEARCH_EXTRA,
  type DashboardNavItem,
} from '@/lib/dashboardNav'
import { fetchJson } from '@/lib/fetchJson'

type PageHit = { kind: 'page'; label: string; href: string }
type AnnouncementHit = { kind: 'announcement'; id: string; label: string; href: string }
type MemberHit = { kind: 'member'; id: string; label: string; sub: string; href: string }
type SearchHit = PageHit | AnnouncementHit | MemberHit

function normalize(q: string) {
  return q.trim().toLowerCase()
}

function filterNavForRole(items: DashboardNavItem[], role: string, q: string): PageHit[] {
  const n = normalize(q)
  if (n.length < 1) return []
  return [...items, ...DASHBOARD_SEARCH_EXTRA]
    .filter((item) => item.roles.includes(role as DashboardNavItem['roles'][number]))
    .filter(
      (item) =>
        item.label.toLowerCase().includes(n) ||
        item.href.toLowerCase().includes(n)
    )
    .map((item) => ({ kind: 'page' as const, label: item.label, href: item.href }))
}

export default function DashboardSearch() {
  const router = useRouter()
  const { profile } = useResident()
  const role = profile?.role ?? 'RESIDENT'
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [remoteLoading, setRemoteLoading] = useState(false)
  const [remote, setRemote] = useState<{
    announcements: { id: string; title: string; href: string }[]
    residents: { id: string; label: string; sub: string; href: string }[]
  } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const pageHits = filterNavForRole(DASHBOARD_NAV_ITEMS, role, query)

  const loadRemote = useCallback(
    async (q: string) => {
      const t = q.trim()
      if (t.length < 2) {
        setRemote(null)
        return
      }
      setRemoteLoading(true)
      const { data } = await fetchJson<{
        announcements: { id: string; title: string; href: string }[]
        residents: { id: string; label: string; sub: string; href: string }[]
      }>(`/api/dashboard/search?q=${encodeURIComponent(t)}`)
      setRemote(data ?? { announcements: [], residents: [] })
      setRemoteLoading(false)
    },
    []
  )

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void loadRemote(query)
    }, 280)
    return () => clearTimeout(debounceRef.current)
  }, [query, loadRemote])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const announcementHits: AnnouncementHit[] =
    remote?.announcements.map((a) => ({
      kind: 'announcement' as const,
      id: a.id,
      label: a.title,
      href: a.href,
    })) ?? []

  const memberHits: MemberHit[] =
    remote?.residents.map((r) => ({
      kind: 'member' as const,
      id: r.id,
      label: r.label,
      sub: r.sub,
      href: r.href,
    })) ?? []

  const hasQuery = query.trim().length > 0
  const showPanel = open && hasQuery
  const hasAny =
    pageHits.length > 0 || announcementHits.length > 0 || memberHits.length > 0

  function go(hit: SearchHit) {
    router.push(hit.href)
    setOpen(false)
    setQuery('')
    setRemote(null)
  }

  return (
    <div ref={rootRef} className="relative w-full min-w-0 max-w-[14rem] sm:max-w-xs md:w-52 lg:max-w-sm">
      <div
        className={cn(
          'flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm',
          open && 'ring-2 ring-brand-500/30 border-brand-200'
        )}
      >
        <Search size={14} className="shrink-0 text-gray-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search pages, people…"
          className="min-w-0 flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none"
          aria-label="Search dashboard"
          autoComplete="off"
        />
      </div>

      {showPanel && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-[min(70vh,420px)] w-[min(100vw-1.5rem,20rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-lg sm:w-80"
          role="listbox"
        >
          {remoteLoading && (
            <p className="px-3 py-2 text-xs text-gray-500">Searching…</p>
          )}
          {!remoteLoading && !hasAny && (
            <p className="px-3 py-2 text-sm text-gray-500">No matches.</p>
          )}

          {pageHits.length > 0 && (
            <div className="px-2 pb-2">
              <p className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                <LayoutGrid size={12} /> Pages
              </p>
              <ul className="space-y-0.5">
                {pageHits.map((h) => (
                  <li key={h.href}>
                    <button
                      type="button"
                      onClick={() => go(h)}
                      className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
                    >
                      {h.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {announcementHits.length > 0 && (
            <div className="border-t border-gray-100 px-2 py-2">
              <p className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                <Megaphone size={12} /> Announcements
              </p>
              <ul className="space-y-0.5">
                {announcementHits.map((h) => (
                  <li key={`a-${h.id}`}>
                    <button
                      type="button"
                      onClick={() => go(h)}
                      className="flex w-full items-start rounded-md px-2 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
                    >
                      {h.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {memberHits.length > 0 && (
            <div className="border-t border-gray-100 px-2 py-2">
              <p className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                <Users size={12} /> Members
              </p>
              <ul className="space-y-0.5">
                {memberHits.map((h) => (
                  <li key={`m-${h.id}`}>
                    <button
                      type="button"
                      onClick={() => go(h)}
                      className="flex w-full flex-col rounded-md px-2 py-2 text-left hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-900">{h.label}</span>
                      <span className="text-xs text-gray-500">{h.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
