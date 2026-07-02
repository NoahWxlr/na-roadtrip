import type { Metadata } from 'next'
import { getTrips } from '@/lib/trips'
import TripsGrid from '@/components/TripsGrid'

export const metadata: Metadata = {
  title: 'All trips',
  description: 'Every destination across the 30-year plan — a directory of trips.',
}

export default function TripsPage() {
  const trips = getTrips()

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">All trips</h1>
      <p className="mb-10 mt-3 text-[var(--text-secondary)]">
        {trips.length} destinations. 30 years.
      </p>
      <TripsGrid trips={trips} />
    </div>
  )
}
