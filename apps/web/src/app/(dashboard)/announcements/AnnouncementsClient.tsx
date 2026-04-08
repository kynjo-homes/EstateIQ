'use client'
import { useEffect, useState } from 'react'
import {
  Plus, Megaphone, Trash2, Pencil, ChevronDown, ChevronUp,
  AlertTriangle, AlertCircle, Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchJson } from '@/lib/fetchJson'
import AnnouncementModal from './AnnouncementModal'
import { useResident } from '@/context/ResidentContext'

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface Announcement {
  id: string
  title: string
  body: string
  priority: Priority
  createdAt: string
}

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW:    'bg-gray-100    text-gray-600',
  NORMAL: 'bg-brand-50    text-brand-700',
  HIGH:   'bg-amber-50   text-amber-700',
  URGENT: 'bg-red-50     text-red-700',
}

const PRIORITY_DOT: Record<Priority, string> = {
  LOW:    'bg-gray-400',
  NORMAL: 'bg-brand-500',
  HIGH:   'bg-amber-500',
  URGENT: 'bg-red-500',
}

const PRIORITY_COLUMNS: {
  key: Priority
  label: string
  icon: typeof AlertTriangle
  color: string
  bg: string
}[] = [
  { key: 'URGENT', label: 'Urgent', icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50'    },
  { key: 'HIGH',   label: 'High',   icon: AlertCircle,   color: 'text-amber-600', bg: 'bg-amber-50'  },
  { key: 'NORMAL', label: 'Normal', icon: Megaphone,    color: 'text-brand-600', bg: 'bg-brand-50'  },
  { key: 'LOW',    label: 'Low',    icon: Minus,        color: 'text-gray-600',  bg: 'bg-gray-50'   },
]

export default function AnnouncementsClient() {
  const { isAdmin }                       = useResident()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading]             = useState(true)
  const [showModal, setShowModal]         = useState(false)
  const [editing, setEditing]             = useState<Announcement | null>(null)
  const [expanded, setExpanded]           = useState<string | null>(null)
  const [view, setView]                   = useState<'kanban' | 'list'>('kanban')
  const [deleting, setDeleting]           = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await fetchJson<Announcement[]>('/api/announcements')
    setAnnouncements(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement? This cannot be undone.')) return
    setDeleting(id)
    await fetchJson(`/api/announcements/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  const byPriority = (p: Priority) => announcements.filter(a => a.priority === p)

  const counts = {
    ALL:    announcements.length,
    URGENT: byPriority('URGENT').length,
    HIGH:   byPriority('HIGH').length,
    NORMAL: byPriority('NORMAL').length,
    LOW:    byPriority('LOW').length,
  }

  const listSorted = [...announcements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const stats = [
    { label: 'Total',  value: counts.ALL,    color: 'text-gray-900'   },
    { label: 'Urgent', value: counts.URGENT, color: 'text-red-600'    },
    { label: 'High',   value: counts.HIGH,   color: 'text-amber-600'  },
    { label: 'Normal', value: counts.NORMAL, color: 'text-brand-600'  },
    { label: 'Low',    value: counts.LOW,    color: 'text-gray-500'   },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      <div className="px-6 py-4 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          {stats.map(({ label, value, color }) => (
            <div key={label}>
              <span className={cn('text-xl font-semibold', color)}>{value}</span>
              <span className="text-xs text-gray-400 ml-1.5">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border border-gray-200 rounded overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={cn(
                'px-3 py-1.5 transition-colors',
                view === 'kanban' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'px-3 py-1.5 transition-colors',
                view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              List
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => { setEditing(null); setShowModal(true) }}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              <Plus size={15} /> New announcement
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">

        {loading && (
          <div className="space-y-3">
            {view === 'kanban' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex flex-col gap-3 min-w-0">
                    <div className="h-9 bg-gray-100 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
                      <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border-b border-gray-50 px-4 py-4 animate-pulse flex gap-4">
                    <div className="h-4 bg-gray-100 rounded flex-1 max-w-md" />
                    <div className="h-4 bg-gray-100 rounded w-20" />
                    <div className="h-4 bg-gray-100 rounded w-28" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
            <Megaphone size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No announcements yet</p>
            <p className="text-gray-400 text-xs mt-1">
              {isAdmin
                ? 'Create your first announcement to notify residents.'
                : 'No announcements from your estate admin yet.'}
            </p>
          </div>
        )}

        {!loading && announcements.length > 0 && view === 'kanban' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {PRIORITY_COLUMNS.map(({ key, label, icon: Icon, color, bg }) => {
              const col = byPriority(key)
              return (
                <div key={key} className="flex flex-col gap-3 min-w-0">
                  <div className={cn('flex items-center gap-2 px-3 py-2 rounded', bg)}>
                    <Icon size={14} className={color} />
                    <span className={cn('text-xs font-semibold', color)}>{label}</span>
                    <span
                      className={cn(
                        'ml-auto text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center',
                        bg,
                        color
                      )}
                    >
                      {col.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    {col.length === 0 && (
                      <div className="border-2 border-dashed border-gray-100 rounded-xl p-6 text-center">
                        <p className="text-xs text-gray-300">None</p>
                      </div>
                    )}
                    {col.map(a => (
                      <AnnouncementCard
                        key={a.id}
                        announcement={a}
                        expanded={expanded === a.id}
                        onToggleExpand={() => setExpanded(expanded === a.id ? null : a.id)}
                        isAdmin={isAdmin}
                        deleting={deleting === a.id}
                        onEdit={() => { setEditing(a); setShowModal(true) }}
                        onDelete={() => handleDelete(a.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && announcements.length > 0 && view === 'list' && (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Title', 'Priority', 'Posted', ...(isAdmin ? [''] : [])].map(h => (
                    <th key={h || 'actions'} className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listSorted.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{a.body}</p>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                          PRIORITY_STYLES[a.priority]
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[a.priority])} />
                        {a.priority.charAt(0) + a.priority.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 align-top whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => { setEditing(a); setShowModal(true) }}
                            className="p-2 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(a.id)}
                            disabled={deleting === a.id}
                            className="p-2 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && isAdmin && (
        <AnnouncementModal
          existing={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSuccess={() => { setShowModal(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function AnnouncementCard({
  announcement: a,
  expanded,
  onToggleExpand,
  isAdmin,
  deleting,
  onEdit,
  onDelete,
}: {
  announcement: Announcement
  expanded: boolean
  onToggleExpand: () => void
  isAdmin: boolean
  deleting: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const isLong = a.body.length > 160

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
      <div
        className={cn(
          'h-1',
          a.priority === 'URGENT' ? 'bg-red-500' :
          a.priority === 'HIGH'   ? 'bg-amber-400' :
          a.priority === 'NORMAL' ? 'bg-green-400' : 'bg-gray-200'
        )}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                  PRIORITY_STYLES[a.priority]
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[a.priority])} />
                {a.priority.charAt(0) + a.priority.slice(1).toLowerCase()}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(a.createdAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-snug">{a.title}</h3>

            <p
              className={cn(
                'text-sm text-gray-600 leading-relaxed',
                !expanded && isLong && 'line-clamp-2'
              )}
            >
              {a.body}
            </p>

            {isLong && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 mt-1.5 font-medium"
              >
                {expanded
                  ? <><ChevronUp size={12} /> Show less</>
                  : <><ChevronDown size={12} /> Read more</>}
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
