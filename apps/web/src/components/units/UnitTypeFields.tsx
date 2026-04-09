'use client'

import { cn } from '@/lib/utils'
import { UNIT_TYPE_OPTIONS, UNIT_TYPE_OTHER } from '@/lib/unitTypes'

interface Props {
  typeSelect: string
  typeOther: string
  onTypeSelectChange: (value: string) => void
  onTypeOtherChange: (value: string) => void
  /** Tighter spacing for inline forms (e.g. Add member modal) */
  compact?: boolean
  idPrefix?: string
}

export default function UnitTypeFields({
  typeSelect,
  typeOther,
  onTypeSelectChange,
  onTypeOtherChange,
  compact = false,
  idPrefix = 'unit-type',
}: Props) {
  const selId = `${idPrefix}-select`
  const otherId = `${idPrefix}-other`

  return (
    <div className={cn('space-y-1.5', compact && 'space-y-1')}>
      <label
        htmlFor={selId}
        className={cn(
          'block font-medium text-gray-700',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        Type
      </label>
      <select
        id={selId}
        value={typeSelect}
        onChange={e => onTypeSelectChange(e.target.value)}
        className={cn(
          'w-full rounded-lg border bg-white text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
          compact
            ? 'border-brand-200 px-3 py-2 text-sm focus:ring-2 focus:ring-green-400'
            : 'border-gray-200 px-3 py-2'
        )}
      >
        <option value="">Not specified</option>
        {UNIT_TYPE_OPTIONS.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value={UNIT_TYPE_OTHER}>Other…</option>
      </select>
      {typeSelect === UNIT_TYPE_OTHER && (
        <div>
          <label htmlFor={otherId} className="sr-only">
            Describe unit type
          </label>
          <input
            id={otherId}
            type="text"
            value={typeOther}
            onChange={e => onTypeOtherChange(e.target.value)}
            placeholder="Describe unit type"
            className={cn(
              'w-full rounded-lg border text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
              compact
                ? 'border-brand-200 px-3 py-2 text-sm focus:ring-2 focus:ring-green-400'
                : 'border-gray-200 px-3 py-2'
            )}
          />
        </div>
      )}
    </div>
  )
}
