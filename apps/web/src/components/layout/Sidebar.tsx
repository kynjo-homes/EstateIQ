'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import logo from '@/components/images/logo.png'
import {
  LayoutDashboard, Users, Megaphone, CreditCard,
  ShieldCheck, Wrench, CalendarCheck, BarChart2,
  AlertTriangle, LogOut, ChevronLeft, ChevronRight,
  Car, ScanLine,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { useResident } from '@/context/ResidentContext'
import SubscriptionGate from '@/components/SubscriptionGate'
import { CreditCard as SubscriptionIcon } from 'lucide-react'

type Role = 'ADMIN' | 'SUPER_ADMIN' | 'SECURITY' | 'RESIDENT'

interface NavItem {
  label: string
  href:  string
  icon:  any
  roles: Role[]   // which roles can see this item
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href:  '/dashboard',
    icon:  LayoutDashboard,
    roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'],
  },
  {
    label: 'Residents',
    href:  '/residents',
    icon:  Users,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Announcements',
    href:  '/announcements',
    icon:  Megaphone,
    roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'],
  },
  {
    label: 'Levies & Dues',
    href:  '/levies',
    icon:  CreditCard,
    roles: ['ADMIN', 'SUPER_ADMIN', 'RESIDENT'],
  },
  {
    label: 'Visitors',
    href:  '/visitors',
    icon:  ShieldCheck,
    roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'],
  },
  {
    label: 'Maintenance',
    href:  '/maintenance',
    icon:  Wrench,
    roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'],
  },
  {
    label: 'Facilities',
    href:  '/facilities',
    icon:  CalendarCheck,
    roles: ['ADMIN', 'SUPER_ADMIN', 'RESIDENT'],
  },
  {
    label: 'Polls',
    href:  '/polls',
    icon:  BarChart2,
    roles: ['ADMIN', 'SUPER_ADMIN', 'RESIDENT'],
  },
  {
    label: 'Incidents',
    href:  '/incidents',
    icon:  AlertTriangle,
    roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'],
  },
  {
    label: 'Vehicles',
    href:  '/vehicles',
    icon:  Car,
    roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY'],
  },
  {
    label: 'Gate scanner',
    href:  '/vehicles/scan',
    icon:  ScanLine,
    roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY'],
  },
  {
    label: 'Subscription',
    href:  '/subscription',
    icon:  SubscriptionIcon,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
]

const ROLE_BADGE: Record<string, string> = {
  ADMIN:       'bg-purple-900/50 text-purple-300',
  SUPER_ADMIN: 'bg-red-900/50    text-red-300',
  SECURITY:    'bg-amber-900/50  text-amber-300',
  RESIDENT:    'bg-gray-800      text-gray-400',
}

export default function Sidebar() {
  const pathname              = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { profile }           = useResident()

  const currentRole = (profile?.role ?? 'RESIDENT') as Role

  const visibleItems = navItems.filter(item =>
    item.roles.includes(currentRole)
  )

  return (
    <aside className={cn(
      'relative flex flex-col bg-[#111827] text-white transition-all duration-300 min-h-screen shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>

      {/* Logo */}
      <Link href="/dashboard" className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-gray-800',
        collapsed && 'justify-center px-2'
      )}>
        <Image
          src={logo}
          alt="EstateIQ"
          width={collapsed ? 32 : 140}
          height={collapsed ? 32 : 40}
          className={cn(
            'object-contain shrink-0',
            collapsed ? 'h-8 w-8' : 'h-10 w-auto max-w-[140px]'
          )}
        />
      </Link>

      {/* Role badge */}
      {!collapsed && profile?.role && (
        <div className="px-4 pt-3 pb-1">
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            ROLE_BADGE[profile.role] ?? ROLE_BADGE.RESIDENT
          )}>
            {profile.role === 'SUPER_ADMIN'
              ? 'Super admin'
              : profile.role.charAt(0) + profile.role.slice(1).toLowerCase()
            }
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                collapsed && 'justify-center px-2',
                active
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-4 border-t border-gray-800 pt-3">
        <button
          onClick={() => signOut({ callbackUrl: '/sign-in' })}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(p => !p)}
        className="absolute -right-3 top-6 bg-[#111827] border border-gray-700 rounded-full p-0.5 text-gray-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}