import type { Metadata } from 'next'
import MarketingPageShell from '@/components/marketing/MarketingPageShell'

export const metadata: Metadata = {
  title: 'Careers — Kynjo.Homes',
  description: 'Join the team building Kynjo.Homes.',
}

export default function CareersPage() {
  return (
    <MarketingPageShell title="Careers" description="We are growing our product and customer team.">
      <p>
        We do not have open roles listed publicly yet. If you are passionate about prop-tech,
        community operations, or building reliable SaaS for Nigeria, we would love to hear from you.
      </p>
      <p>
        Send your CV and a short note to{' '}
        <a href="mailto:careers@kynjo.homes" className="text-green-600 hover:underline">
          careers@kynjo.homes
        </a>
        . We review every message.
      </p>
    </MarketingPageShell>
  )
}
