'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export type NotificationFocusPayload = {
  notificationId: string | null
  focusKind: string | null
  focusId: string | null
}

/**
 * Reads `ni`, `fk`, `fid` from the URL, marks the notification read, invokes `onFocus`,
 * then strips those params from the address bar.
 */
export function useNotificationDeepLink(onFocus: (payload: NotificationFocusPayload) => void) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const onFocusRef = useRef(onFocus)
  onFocusRef.current = onFocus
  const lastKey = useRef<string | null>(null)

  useEffect(() => {
    const ni = searchParams.get('ni')
    const fk = searchParams.get('fk')
    const fid = searchParams.get('fid')
    if (!ni && !fid) {
      lastKey.current = null
      return
    }

    const key = searchParams.toString()
    if (lastKey.current === key) return
    lastKey.current = key

    if (ni) {
      void fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: [ni] }),
      })
    }

    requestAnimationFrame(() => {
      onFocusRef.current({
        notificationId: ni,
        focusKind: fk,
        focusId: fid,
      })

      const next = new URLSearchParams(searchParams.toString())
      next.delete('ni')
      next.delete('fk')
      next.delete('fid')
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }, [searchParams, pathname, router])
}
