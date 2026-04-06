'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  initials: string
}

export default function UserMenu({ initials }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const menuId = 'user-menu-dropdown'

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        id="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white',
          'outline-none ring-brand-600/30 transition hover:bg-brand-700 focus-visible:ring-2'
        )}
      >
        {initials}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby="user-menu-trigger"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[11rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <User size={16} className="shrink-0 text-gray-500" />
            My Profile
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <Settings size={16} className="shrink-0 text-gray-500" />
            Settings
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setOpen(false)
              void signOut({ redirect: false })
                .then(() => {
                  window.location.assign('/sign-in')
                })
                .catch(() => {
                  window.location.assign('/sign-in')
                })
            }}
          >
            <LogOut size={16} className="shrink-0 text-gray-500" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
