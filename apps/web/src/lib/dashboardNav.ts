export type DashboardRole = 'ADMIN' | 'SUPER_ADMIN' | 'SECURITY' | 'RESIDENT'

export interface DashboardNavItem {
  label: string
  href: string
  roles: DashboardRole[]
}

/** Primary sidebar navigation (order matches the sidebar). */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'] },
  { label: 'Members', href: '/residents', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY'] },
  { label: 'Units', href: '/units', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'] },
  { label: 'Announcements', href: '/announcements', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'] },
  { label: 'Levies & Dues', href: '/levies', roles: ['ADMIN', 'SUPER_ADMIN', 'RESIDENT'] },
  { label: 'Visitors', href: '/visitors', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'] },
  { label: 'Maintenance', href: '/maintenance', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'] },
  { label: 'Facilities', href: '/facilities', roles: ['ADMIN', 'SUPER_ADMIN', 'RESIDENT'] },
  { label: 'Polls', href: '/polls', roles: ['ADMIN', 'SUPER_ADMIN', 'RESIDENT'] },
  { label: 'Incidents', href: '/incidents', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'] },
  { label: 'Vehicles', href: '/vehicles', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'] },
  { label: 'Scanner', href: '/vehicles/scan', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY'] },
  { label: 'Subscription', href: '/subscription', roles: ['ADMIN', 'SUPER_ADMIN'] },
]

/** Extra routes surfaced in global dashboard search (not necessarily in the sidebar). */
export const DASHBOARD_SEARCH_EXTRA: DashboardNavItem[] = [
  { label: 'Settings', href: '/settings', roles: ['ADMIN', 'SUPER_ADMIN', 'SECURITY', 'RESIDENT'] },
]

export const NAV_HREFS = DASHBOARD_NAV_ITEMS.map((i) => i.href)

/** True when pathname matches this item, but not when a longer nav href is a better match. */
export function isNavActive(pathname: string, href: string) {
  if (pathname === href) return true
  if (!pathname.startsWith(href + '/')) return false
  const moreSpecific = NAV_HREFS.filter(
    (h) =>
      h !== href &&
      h.startsWith(href + '/') &&
      (pathname === h || pathname.startsWith(h + '/'))
  )
  return moreSpecific.length === 0
}
