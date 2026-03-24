'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, X, ArrowRight, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pricingPlans } from '@/lib/pricingPlans'

export default function PricingPage() {
  const router = useRouter()

  function handleSelect(planId: string) {
    if (planId === 'CUSTOM') {
      window.location.href = 'mailto:sales@estateiq.app?subject=Custom plan enquiry'
      return
    }
    router.push(`/sign-up?plan=${planId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">EstateIQ</span>
          </Link>
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Choose the plan that works for your estate. Start free, upgrade when you are ready.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map(plan => (
            <div
              key={plan.id}
              className={cn(
                'bg-white rounded-2xl flex flex-col',
                plan.featured
                  ? 'border-2 border-green-500 shadow-lg shadow-green-100'
                  : 'border border-gray-100'
              )}
            >
              {/* Header */}
              <div className="p-6 pb-0">
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    Most popular
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-sm text-gray-500 mt-1 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={cn(
                    'font-extrabold text-gray-900',
                    plan.price ? 'text-3xl' : 'text-2xl'
                  )}>
                    {plan.priceLabel}
                  </span>
                  {plan.priceSub && (
                    <span className="text-sm text-gray-400">{plan.priceSub}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="p-6 flex-1">
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  {plan.features.map(({ label, included }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      {included
                        ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                        : <X           size={15} className="text-gray-300 shrink-0" />
                      }
                      <span className={cn(
                        'text-sm',
                        included ? 'text-gray-700' : 'text-gray-300 line-through'
                      )}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleSelect(plan.id)}
                  className={cn(
                    'w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2',
                    plan.featured
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {plan.cta} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            All plans include a 7-day trial of Professional features after sign-up.
            Questions?{' '}
            <a href="mailto:hello@estateiq.app" className="text-green-600 hover:underline">
              hello@estateiq.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
