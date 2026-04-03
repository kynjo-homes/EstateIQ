import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/components/images/logo2.png'
import ContactDetails from './ContactDetails'
import ContactForm from './ContactForm'
import NewsletterForm from '@/components/NewsletterForm'

export const metadata: Metadata = {
  title: 'Contact — Kynjo.Homes',
  description: 'Get in touch with the Kynjo.Homes team.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center mb-10">
          <Image
            src={logo}
            alt="Kynjo.Homes"
            height={64}
            width={224}
            className="h-16 w-auto object-contain"
          />
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Contact us</h1>
          <p className="text-gray-500 text-sm mt-1">
            We typically respond within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact details</h2>
              <ContactDetails />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Send a message</h2>
              <p className="text-sm text-gray-500 mb-4">
                Use the form below and we will reply by email.
              </p>
              <ContactForm />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-green-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
