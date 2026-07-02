import { getTrip } from '@/lib/trips'
import { REGION_LABELS } from '@/lib/regions'

export default function TripStats({ slug }: { slug: string }) {
  const trip = getTrip(slug)
  if (!trip) return null

  const stats = [
    { label: 'Year', value: `${trip.year}` },
    { label: 'Days', value: `${trip.days}` },
    { label: 'Intensity', value: `${trip.intensity}/5` },
    { label: 'Region', value: REGION_LABELS[trip.region] },
  ]

  return (
    <div className="my-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-4 font-display text-lg font-semibold">{trip.name}</div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              {s.label}
            </dt>
            <dd className="mt-1 font-display text-xl font-bold">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
