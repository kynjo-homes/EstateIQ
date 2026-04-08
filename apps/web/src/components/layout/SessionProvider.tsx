'use client'

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import type { AppSession } from '@/lib/session'

type SessionContextValue = {
  session: AppSession | null
  status: 'authenticated' | 'unauthenticated' | 'loading'
  update: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

/** Same shape as next-auth `useSession` for drop-in replacement. */
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return {
    data: ctx.session,
    status: ctx.status,
    update: ctx.update,
  }
}

export default function SessionProvider({
  children,
  session,
}: {
  children: ReactNode
  session: AppSession | null
}) {
  const value: SessionContextValue = {
    session,
    status: session ? 'authenticated' : 'unauthenticated',
    update: async () => {
      /* session comes from server; refresh route if needed */
    },
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
