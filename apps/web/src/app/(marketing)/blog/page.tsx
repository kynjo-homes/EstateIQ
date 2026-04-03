import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingPageShell from '@/components/marketing/MarketingPageShell'

export const metadata: Metadata = {
  title: 'Blog — Kynjo.Homes',
  description: 'Updates and guides on estate management with Kynjo.Homes.',
}

export default function BlogPage() {
  return (
    <MarketingPageShell title="Blog" description="Product updates and estate management insights.">
      <p>
        We are preparing articles on levy collection, visitor management, compliance, and community
        operations. Check back soon, or{' '}
        <Link href="/contact" className="text-green-600 hover:underline">
          subscribe to updates
        </Link>{' '}
        by reaching out to our team.
      </p>
    </MarketingPageShell>
  )
}
