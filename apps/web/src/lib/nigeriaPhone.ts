/**
 * Nigerian mobile numbers: 11 digits, local format starting with 0
 * (e.g. 08012345678). GSM lines typically use second digit 7, 8, or 9.
 */

const MOBILE_LOCAL = /^0[789]\d{9}$/

/**
 * Sanitize phone input: digits only, max 11; maps +234 / 234 prefix to leading 0.
 */
export function sanitizeNigeriaPhoneInput(raw: string): string {
  let s = raw.trim().replace(/[\s\-().]/g, '')
  if (s.startsWith('+234')) {
    s = '0' + s.slice(4).replace(/\D/g, '')
  } else {
    const d = s.replace(/\D/g, '')
    if (d.startsWith('234') && d.length >= 13) {
      s = '0' + d.slice(3)
    } else {
      s = d
    }
  }
  if (s.length > 11) s = s.slice(0, 11)
  return s
}

/** True if empty (optional field) or a valid 11-digit Nigerian mobile in local form. */
export function isValidNigeriaMobileLocal(digits: string): boolean {
  if (!digits || digits.trim() === '') return true
  return MOBILE_LOCAL.test(digits)
}

export const NIGERIA_PHONE_HINT =
  '11-digit Nigerian mobile (e.g. 08012345678). You can paste +234… and we will fix the format.'
