import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingPageShell from '@/components/marketing/MarketingPageShell'

export const metadata: Metadata = {
  title: 'About — Kynjo.Homes',
  description: 'Learn about Kynjo.Homes and our mission for modern estate management.',
}

export default function AboutPage() {
  return (
    <MarketingPageShell
      title="About Kynjo.Homes"
      description="Intelligent estate management for neighbourhoods across Nigeria."
    >
      <p>
        Kynjo.Homes is built by Bubble Barrel Commerce Limited to help estate managers, HOAs, and
        resident associations run dues, visitors, maintenance, facilities, and security workflows in
        one place—without spreadsheets and endless group chats.
      </p>
      <p>
        We focus on clarity for administrators and a smooth experience for residents: transparent
        levies, reliable notifications, and tools that match how real communities operate day to
        day.
      </p>
      <p>
        Our roadmap is driven by feedback from estates we serve. If you would like to partner or
        learn more, visit our{' '}
        <Link href="/contact" className="text-green-600 hover:underline">
          contact page
        </Link>
        .
      </p>
    </MarketingPageShell>
  )
}
