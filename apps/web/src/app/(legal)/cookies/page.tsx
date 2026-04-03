import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy — Kynjo.Homes',
  description: 'How Kynjo.Homes uses cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Kynjo.Homes</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cookie Policy</h1>
            <p className="text-gray-500 text-sm mt-1">
              Last updated:{' '}
              {new Date().toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {[
            {
              title: '1. What are cookies?',
              body: 'Cookies are small text files stored on your device when you visit a website. They help the site remember your session, preferences, and (where applicable) analytics or marketing choices.',
            },
            {
              title: '2. How we use cookies',
              body: 'Kynjo.Homes uses cookies and similar technologies (such as local storage) that are strictly necessary to operate the service: for example, to keep you signed in after authentication, to remember your cookie consent choice, and to protect the platform against abuse.',
            },
            {
              title: '3. Types of cookies',
              body: 'Essential cookies: required for login, security, and basic site functionality. These cannot be switched off without breaking core features. Preference cookies: remember choices such as dismissing the cookie banner. We do not use third-party advertising cookies on the core product.',
            },
            {
              title: '4. Your choices',
              body: 'When you first visit, you can accept cookies as described in our banner. You can also control or delete cookies through your browser settings. Blocking essential cookies may prevent you from signing in or using parts of the application.',
            },
            {
              title: '5. Third parties',
              body: 'Where we embed payment, email, or hosting services, those providers may set their own cookies in line with their policies. Please refer to Paystack and other processors listed in our Privacy Policy.',
            },
            {
              title: '6. Updates',
              body: 'We may update this Cookie Policy when our practices change. Material updates will be reflected on this page with a new “Last updated” date.',
            },
            {
              title: '7. Contact',
              body: 'Questions about this policy? Contact privacy@kynjo.homes.',
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/privacy" className="text-sm text-green-600 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-green-600 hover:underline">
            Terms of Service
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
