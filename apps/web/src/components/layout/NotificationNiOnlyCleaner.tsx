'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

/**
 * When a notification links with only `ni` (no `fk`/`fid`), mark read and strip the query.
 * Pages that use {@link useNotificationDeepLink} handle the full triple; this covers welcome/subscription links.
 */
export default function NotificationNiOnlyCleaner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const lastKey = useRef<string | null>(null)

  useEffect(() => {
    const ni = searchParams.get('ni')
    const fk = searchParams.get('fk')
    const fid = searchParams.get('fid')
    if (!ni || fk || fid) {
      if (!ni && !fk && !fid) lastKey.current = null
      return
    }

    const key = searchParams.toString()
    if (lastKey.current === key) return
    lastKey.current = key

    void fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: [ni] }),
    })

    const next = new URLSearchParams(searchParams.toString())
    next.delete('ni')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, pathname, router])

  return null
}
