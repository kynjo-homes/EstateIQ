/** Sentinel value for the "Other" option in selects — never stored on the unit row */
export const UNIT_TYPE_OTHER = '__OTHER__' as const

export const UNIT_TYPE_OPTIONS = [
  'Studio',
  '1 bedroom apartment',
  '2 bedroom apartment',
  '3 bedroom apartment',
  '4+ bedroom apartment',
  'Duplex',
  '3 bedroom duplex',
  'Semi-detached',
  'Detached house',
  'Penthouse',
  'Townhouse',
  'Commercial / office',
] as const

export function resolveUnitTypeForSubmit(
  typeSelect: string,
  typeOther: string
): string | null {
  const s = typeSelect.trim()
  if (!s) return null
  if (s === UNIT_TYPE_OTHER) {
    const o = typeOther.trim()
    return o || null
  }
  return s
}
