import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { getContactInfo } from '@/lib/contactInfo'

export default function ContactDetails() {
  const info = getContactInfo()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Corporate</h2>
        <p className="mt-1 text-sm font-medium text-gray-800">{info.companyName}</p>
      </div>

      <div className="flex gap-3">
        <MapPin className="size-5 text-green-600 shrink-0 mt-0.5" aria-hidden />
        <address className="text-sm text-gray-600 not-italic leading-relaxed">
          {info.addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      </div>

      <div className="flex gap-3 items-start">
        <Phone className="size-5 text-green-600 shrink-0 mt-0.5" aria-hidden />
        <div className="text-sm">
          <a href={info.phoneTelHref} className="text-gray-800 hover:text-green-600 font-medium">
            {info.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <Mail className="size-5 text-green-600 shrink-0 mt-0.5" aria-hidden />
        <a
          href={`mailto:${info.email}`}
          className="text-sm text-gray-800 hover:text-green-600 font-medium break-all"
        >
          {info.email}
        </a>
      </div>

      <div className="flex gap-3 items-start">
        <MessageCircle className="size-5 text-green-600 shrink-0 mt-0.5" aria-hidden />
        <a
          href={info.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-600 hover:underline font-medium"
        >
          Chat on WhatsApp
        </a>
      </div>

      <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
        For privacy-related requests, email{' '}
        <a href="mailto:privacy@kynjo.homes" className="text-green-600 hover:underline">
          privacy@kynjo.homes
        </a>
        .
      </p>
    </div>
  )
}
