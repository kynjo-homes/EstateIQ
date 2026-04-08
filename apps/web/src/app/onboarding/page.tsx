import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/session'
import OnboardingWizard from './OnboardingWizard'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/onboarding')
  }

  const userName = session.user.name ?? ''

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <OnboardingWizard userName={userName} />
    </Suspense>
  )
}
