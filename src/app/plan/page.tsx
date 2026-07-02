import type { Metadata } from 'next'
import { getPlan, getStats, getTrips } from '@/lib/trips'
import PlanTimeline from '@/components/timeline/PlanTimeline'

export const metadata: Metadata = {
  title: 'The 30-year plan',
  description:
    'A lifetime travel plan — every destination, trek, and road-trip loop across 30 years.',
}

export default function PlanPage() {
  const plan = getPlan()
  const trips = getTrips()
  const stats = getStats()

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">
        The 30-year plan
      </h1>
      <p className="mt-3 text-[var(--text-secondary)]">
        {stats.total} trips · {stats.years} years · {stats.gapYears} gap years ·{' '}
        {stats.continents} regions
      </p>

      <div className="mt-10">
        <PlanTimeline plan={plan} trips={trips} />
      </div>
    </div>
  )
}
