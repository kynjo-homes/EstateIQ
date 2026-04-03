/**
 * Public contact details (override via NEXT_PUBLIC_* in .env).
 * WhatsApp link uses digits only (country code + number, no + or spaces).
 */

export type ContactInfo = {
  companyName: string
  addressLines: string[]
  phoneDisplay: string
  /** href for tel: — include country code */
  phoneTelHref: string
  email: string
  whatsappHref: string
}

function parseAddress(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return ['Bubble Barrel Commerce Limited', 'Lagos, Nigeria']
  }
  return raw.split('|').map((s) => s.trim()).filter(Boolean)
}

function buildTelHref(): string {
  const explicit = process.env.NEXT_PUBLIC_CONTACT_PHONE_TEL?.trim()
  if (explicit) {
    const t = explicit.replace(/\s/g, '')
    return t.startsWith('tel:') ? t : `tel:${t}`
  }
  const display = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+234 (0) 707 890 1075'
  const digits = display.replace(/\D/g, '')
  if (!digits) return 'tel:'
  return `tel:+${digits}`
}

function buildWhatsAppHref(): string {
  const digits =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') || '2347078901075'
  return `https://wa.me/${digits}`
}

export function getContactInfo(): ContactInfo {
  return {
    companyName: process.env.NEXT_PUBLIC_CONTACT_COMPANY ?? 'Bubble Barrel Commerce Limited',
    addressLines: parseAddress(process.env.NEXT_PUBLIC_CONTACT_ADDRESS),
    phoneDisplay: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+234 (0) 707 890 1075',
    phoneTelHref: buildTelHref(),
    email: 'contact@kynjo.homes',
    whatsappHref: buildWhatsAppHref(),
  }
}
