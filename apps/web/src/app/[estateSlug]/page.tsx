import { notFound } from 'next/navigation'
import EstateLandingClient from './EstateLandingClient'

interface Props {
  params: Promise<{ estateSlug: string }>
}

export default async function EstateLandingPage({ params }: Props) {
  const { estateSlug } = await params

  // Fetch estate data server-side
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/estate/${estateSlug}`,
    { cache: 'no-store' }
  )

  if (!res.ok) notFound()

  const estate = await res.json()

  return <EstateLandingClient estate={estate} />
}