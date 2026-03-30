'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type MobileNavContextValue = {
  mobileOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null)

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const value = useMemo(
    () => ({
      mobileOpen,
      openMobileNav: () => setMobileOpen(true),
      closeMobileNav: () => setMobileOpen(false),
    }),
    [mobileOpen]
  )

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  )
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext)
  if (!ctx) {
    throw new Error('useMobileNav must be used within MobileNavProvider')
  }
  return ctx
}
