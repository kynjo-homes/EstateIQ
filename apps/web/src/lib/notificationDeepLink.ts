/**
 * Query params used when opening a resource from an in-app notification:
 * - `ni` — notification id (marks read when landing)
 * - `fk` — focus kind: VISITOR | ANNOUNCEMENT | LEVY
 * - `fid` — entity id to scroll to / open
 */
export const NOTIFICATION_QUERY = {
  id: 'ni',
  focusKind: 'fk',
  focusId: 'fid',
} as const

export function buildNotificationHref(
  basePath: string,
  opts: {
    notificationId: string
    focus?: { kind: string; id: string } | null
  }
) {
  const path = basePath.startsWith('/') ? basePath : `/${basePath}`
  const u = new URL(path, 'http://local.invalid')
  u.searchParams.set(NOTIFICATION_QUERY.id, opts.notificationId)
  if (opts.focus) {
    u.searchParams.set(NOTIFICATION_QUERY.focusKind, opts.focus.kind)
    u.searchParams.set(NOTIFICATION_QUERY.focusId, opts.focus.id)
  }
  return u.pathname + u.search
}
