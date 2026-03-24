import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@estateiq/database'
import Sidebar from '@/components/layout/Sidebar'
import SessionProvider from '@/components/layout/SessionProvider'
import { ResidentProvider } from '@/context/ResidentContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import SubscriptionBanner from '@/components/SubscriptionBanner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const resident = await prisma.resident.findUnique({
    where: { userId: session.user.id },
  })
  if (!resident) redirect('/onboarding')

  return (
    <SessionProvider session={session}>
      <ResidentProvider>
      <SubscriptionProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SubscriptionBanner />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </SubscriptionProvider>
      </ResidentProvider>
    </SessionProvider>
  )
}