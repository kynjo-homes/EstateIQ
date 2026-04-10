'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchJson } from '@/lib/fetchJson'

interface ResidentProfile {
  id:        string
  firstName: string
  lastName:  string
  role:      string
  estateId:  string
  unit:      { number: string; block: string | null } | null
  estate?:   { name: string }
}

interface ResidentContextType {
  profile: ResidentProfile | null
  loading: boolean
  /** Estate admins (manage most estate features). */
  isAdmin: boolean
  /** Admins + super admins — can add/edit/remove members. */
  canManageMembers: boolean
  /** Admins, super admins, or security — can open the members directory (security is view-only). */
  canViewMembers: boolean
}

const ResidentContext = createContext<ResidentContextType>({
  profile: null,
  loading: true,
  isAdmin: false,
  canManageMembers: false,
  canViewMembers: false,
})

export function ResidentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ResidentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await fetchJson<ResidentProfile>('/api/residents/me')
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  const role = profile?.role
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
  const canManageMembers = isAdmin
  const canViewMembers = isAdmin || role === 'SECURITY'

  return (
    <ResidentContext.Provider
      value={{ profile, loading, isAdmin, canManageMembers, canViewMembers }}
    >
      {children}
    </ResidentContext.Provider>
  )
}

export const useResident = () => useContext(ResidentContext)