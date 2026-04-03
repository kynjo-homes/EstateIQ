import type { Metadata } from 'next'
import './globals.css'
import { validateEnv } from '@/lib/env'
import CookieConsent from '@/components/CookieConsent'

// Runs at build/startup time on the server
if (typeof window === 'undefined') {
  validateEnv()
}

export const metadata: Metadata = {
  title: 'Kynjo.Homes',
  description: 'Smart estate management for modern neighborhoods',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}