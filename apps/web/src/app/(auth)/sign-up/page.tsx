import { Suspense } from 'react'
import SignUpForm from './SignUpForm'

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  )
}
