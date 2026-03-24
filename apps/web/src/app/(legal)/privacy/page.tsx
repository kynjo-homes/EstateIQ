import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">EstateIQ</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mt-1">Last updated: {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {[
            {
              title: '1. Who we are',
              body: 'EstateIQ is an estate management platform operated in Nigeria. We are committed to protecting your personal data and complying with the Nigeria Data Protection Act (NDPA) 2023 and the Nigeria Data Protection Regulation (NDPR).',
            },
            {
              title: '2. Data we collect',
              body: 'We collect the following categories of personal data: Identity data (full name, email address, phone number), Account data (password hash, role, unit assignment), Payment data (levy payment status and history — we do not store card details, these are handled by Paystack), Access data (visitor logs, vehicle scan events, entry and exit timestamps), Usage data (features accessed, actions performed within the platform), and Device data (IP address, browser type, for security purposes).',
            },
            {
              title: '3. How we use your data',
              body: 'We use your data to provide and operate the EstateIQ platform, to process levy payments and send payment confirmations, to manage visitor and vehicle access to your estate, to send important announcements and platform notifications, to investigate security incidents, to comply with legal obligations, and to improve our services.',
            },
            {
              title: '4. Legal basis for processing',
              body: 'Under the NDPA 2023, we process your data on the following bases: Consent — you have given explicit consent by accepting these terms. Contract — processing is necessary to provide the service you have subscribed to. Legal obligation — we may be required to retain certain data by Nigerian law. Legitimate interests — for platform security and fraud prevention.',
            },
            {
              title: '5. Vehicle and access data',
              body: 'The vehicle QR scan system records entry and exit events. This data includes timestamps, vehicle identification, and payment status at time of scan. This constitutes location-adjacent data and is processed only for estate security purposes. It is visible to authorised estate administrators and security staff. It is retained for 12 months then automatically deleted.',
            },
            {
              title: '6. Data sharing',
              body: 'We share your data only with the following parties and only to the extent necessary: Paystack (payment processing), Resend (transactional email delivery), Railway (database infrastructure), and Vercel/Netlify (application hosting). We do not sell your data. We do not share data with third parties for marketing purposes.',
            },
            {
              title: '7. Data retention',
              body: 'Active account data is retained for the duration of your subscription. On account termination, data is retained for 90 days for export, then deleted. Payment records are retained for 7 years as required by Nigerian financial regulations. Vehicle scan logs are retained for 12 months. Anonymised analytics data may be retained indefinitely.',
            },
            {
              title: '8. Your rights',
              body: 'Under the NDPA 2023, you have the right to access your personal data, correct inaccurate data, request deletion of your data, object to processing, request restriction of processing, and data portability. To exercise any of these rights, contact privacy@estateiq.app. We will respond within 30 days.',
            },
            {
              title: '9. Data security',
              body: 'We implement appropriate technical and organisational measures to protect your data including encrypted data transmission (TLS), hashed passwords (bcrypt), role-based access controls, and regular security reviews. However, no system is completely secure and we cannot guarantee absolute security.',
            },
            {
              title: '10. Cookies',
              body: 'We use session cookies for authentication purposes only. We do not use tracking cookies or advertising cookies. You can disable cookies in your browser settings but this will prevent you from logging in.',
            },
            {
              title: '11. Changes to this policy',
              body: 'We will notify you of material changes to this policy by email and by a prominent notice on the platform at least 14 days before the changes take effect.',
            },
            {
              title: '12. Contact',
              body: 'For privacy-related enquiries or to exercise your rights under the NDPA, contact us at privacy@estateiq.app or write to our Data Protection Officer.',
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/terms" className="text-sm text-green-600 hover:underline mr-6">
            Terms of Service
          </Link>
          <Link href="/sign-up" className="text-sm text-gray-400 hover:underline">
            Back to sign up
          </Link>
        </div>
      </div>
    </div>
  )
}