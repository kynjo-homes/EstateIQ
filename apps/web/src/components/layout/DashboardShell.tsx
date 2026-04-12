'use client'

import { Suspense, useEffect } from 'react'
import { MobileNavProvider, useMobileNav } from '@/context/MobileNavContext'
import Sidebar from '@/components/layout/Sidebar'
import NotificationNiOnlyCleaner from '@/components/layout/NotificationNiOnlyCleaner'
import { cn } from '@/lib/utils'

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { mobileOpen, closeMobileNav } = useMobileNav()

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileNav()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, closeMobileNav])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobileNav}
      />

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}>
          <NotificationNiOnlyCleaner />
        </Suspense>
        {children}
      </div>
    </div>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </MobileNavProvider>
  )
}
