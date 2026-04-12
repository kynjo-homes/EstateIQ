'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import logo from '@/components/images/logo.webp'
import {
  LayoutDashboard, Users, Megaphone, CreditCard,
  ShieldCheck, Wrench, CalendarCheck, BarChart2,
  AlertTriangle, LogOut, ChevronLeft, ChevronRight,
  Car, ScanLine, Boxes, type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useResident } from '@/context/ResidentContext'
import { useMobileNav } from '@/context/MobileNavContext'
import { CreditCard as SubscriptionIcon } from 'lucide-react'
import { DASHBOARD_NAV_ITEMS, isNavActive, type DashboardRole } from '@/lib/dashboardNav'

const NAV_ICONS: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/residents': Users,
  '/units': Boxes,
  '/announcements': Megaphone,
  '/levies': CreditCard,
  '/visitors': ShieldCheck,
  '/maintenance': Wrench,
  '/facilities': CalendarCheck,
  '/polls': BarChart2,
  '/incidents': AlertTriangle,
  '/vehicles': Car,
  '/vehicles/scan': ScanLine,
  '/subscription': SubscriptionIcon,
}

const navItems = DASHBOARD_NAV_ITEMS.map((item) => ({
  ...item,
  icon: NAV_ICONS[item.href] ?? LayoutDashboard,
}))

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
  const { mobileOpen, closeMobileNav } = useMobileNav()

  const currentRole = (profile?.role ?? 'RESIDENT') as DashboardRole

  const visibleItems = navItems.filter(item =>
    item.roles.includes(currentRole)
  )

  const showCollapsed = collapsed && !mobileOpen

  return (
    <aside
      className={cn(
        'relative flex min-h-0 flex-col bg-[#111827] text-white transition-[transform,width] duration-300 ease-out',
        'fixed inset-y-0 left-0 z-50 w-60 max-w-[85vw] shrink-0 shadow-xl',
        'lg:static lg:z-auto lg:max-w-none lg:shadow-none',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'lg:w-16' : 'lg:w-60'
      )}
    >

      {/* Logo */}
      <Link
        href="/dashboard"
        onClick={closeMobileNav}
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-gray-800',
          showCollapsed && 'justify-center px-2'
        )}
      >
        <Image
          src={logo}
          alt="Kynjo.Homes"
          width={showCollapsed ? 32 : 140}
          height={showCollapsed ? 32 : 40}
          className={cn(
            'object-contain shrink-0',
            showCollapsed ? 'h-8 w-8' : 'h-10 w-auto max-w-[140px]'
          )}
        />
      </Link>

      {/* Role badge */}
      {!showCollapsed && profile?.role && (
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
          const active = isNavActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              onClick={closeMobileNav}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                showCollapsed && 'justify-center px-2',
                active
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!showCollapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-4 border-t border-gray-800 pt-3">
        <button
          onClick={() => {
            closeMobileNav()
            void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
              .finally(() => {
                window.location.assign('/sign-in')
              })
          }}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors',
            showCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!showCollapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        type="button"
        onClick={() => setCollapsed(p => !p)}
        className="absolute -right-3 top-6 hidden rounded-full border border-gray-700 bg-[#111827] p-0.5 text-gray-400 transition-colors hover:text-white lg:block"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}