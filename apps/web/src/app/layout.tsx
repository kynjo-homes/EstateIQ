import type { Metadata } from 'next'
import './globals.css'
import { validateEnv } from '@/lib/env'
import { auth } from '@/lib/session'
import SessionProvider from '@/components/layout/SessionProvider'
import CookieConsent from '@/components/CookieConsent'
import SiteJsonLd from '@/components/seo/SiteJsonLd'
import { getRootMetadata } from '@/lib/siteMetadata'

// Runs at build/startup time on the server
if (typeof window === 'undefined') {
  validateEnv()
}

export const metadata: Metadata = getRootMetadata()

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <SiteJsonLd />
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
        <CookieConsent />
      </body>
    </html>
  )
}