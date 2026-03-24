import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">EstateIQ</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-gray-500 text-sm mt-1">Last updated: {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {[
            {
              title: '1. Acceptance of terms',
              body: 'By creating an account on EstateIQ, you agree to be bound by these Terms of Service and our Privacy Policy. If you are registering on behalf of an estate or organisation, you confirm you have authority to bind that organisation to these terms.',
            },
            {
              title: '2. Description of service',
              body: 'EstateIQ is a software-as-a-service platform for estate and neighbourhood management. Features include resident management, levy collection, visitor access management, maintenance tracking, facility booking, voting, security incident reporting, and vehicle access control.',
            },
            {
              title: '3. Account responsibilities',
              body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your login details with unauthorised persons. Estate administrators are responsible for ensuring residents are lawfully added to the platform and have consented to data processing.',
            },
            {
              title: '4. Payment and dues collection',
              body: 'EstateIQ facilitates payment collection between residents and estate management committees. Payments are processed by Paystack in accordance with their terms of service. EstateIQ is not a financial institution and does not hold funds on behalf of estates or residents.',
            },
            {
              title: '5. Vehicle access and scanning',
              body: 'The vehicle QR sticker system records entry and exit events linked to registered residents. By registering a vehicle, you consent to these events being logged and visible to authorised estate administrators. This data is used solely for estate security and access management.',
            },
            {
              title: '6. Acceptable use',
              body: 'You agree not to use EstateIQ for any unlawful purpose, to harass or harm other users, to transmit false or misleading information, or to attempt to gain unauthorised access to any part of the platform or other users\' data.',
            },
            {
              title: '7. Data and privacy',
              body: 'Your use of EstateIQ is governed by our Privacy Policy which is incorporated into these terms. We process your personal data in accordance with the Nigeria Data Protection Act (NDPA) 2023.',
            },
            {
              title: '8. Service availability',
              body: 'We aim to maintain 99.5% uptime but do not guarantee uninterrupted service. We are not liable for losses arising from planned or unplanned service downtime. We will provide reasonable advance notice of planned maintenance.',
            },
            {
              title: '9. Termination',
              body: 'Either party may terminate an account at any time. Upon termination, your data will be retained for 90 days to allow data export, then permanently deleted unless legally required to retain it. Estate admins may request immediate deletion by contacting support.',
            },
            {
              title: '10. Limitation of liability',
              body: 'EstateIQ is provided on an "as is" basis. To the maximum extent permitted by Nigerian law, we are not liable for indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.',
            },
            {
              title: '11. Governing law',
              body: 'These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Nigeria.',
            },
            {
              title: '12. Contact',
              body: 'For questions about these terms, contact us at legal@estateiq.app',
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/privacy" className="text-sm text-green-600 hover:underline mr-6">
            Privacy Policy
          </Link>
          <Link href="/sign-up" className="text-sm text-gray-400 hover:underline">
            Back to sign up
          </Link>
        </div>
      </div>
    </div>
  )
}