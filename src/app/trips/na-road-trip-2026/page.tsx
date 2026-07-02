import type { Metadata } from 'next'
import Link from 'next/link'
import { getTrip } from '@/lib/trips'
import { getPostsForTrip } from '@/lib/mdx'
import { RoadTripMap } from '@/components/map/MapLoaders'
import { Stars, RegionPill } from '@/components/ui'
import stops from '@/data/na-roadtrip-stops.json'

export const metadata: Metadata = {
  title: 'North America Road Trip',
  description:
    '15,890 miles · 68 stops · 22 national parks · 105 days. The trip that started everything.',
}

const NUMBERS = [
  { value: '15,890', label: 'miles' },
  { value: '68', label: 'stops' },
  { value: '22', label: 'national parks' },
  { value: '9', label: 'permits' },
  { value: '2', label: 'countries' },
  { value: '~105', label: 'days' },
]

export default function NaRoadTripPage() {
  const trip = getTrip('na-road-trip-2026')!
  const posts = getPostsForTrip('na-road-trip-2026')

  return (
    <div className="bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <Link
          href="/trips"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← All trips
        </Link>

        {/* Hero */}
        <header className="mt-6">
          <h1 className="font-display text-4xl font-bold md:text-6xl">
            North America Road Trip
          </h1>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            15,890 miles · 68 stops · 22 national parks · 105 days
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-0.5 text-xs font-medium"
              style={{ backgroundColor: '#22c55e22', color: '#22c55e' }}
            >
              Completed 2026
            </span>
            <RegionPill region={trip.region} />
            <Stars count={trip.intensity} />
          </div>
        </header>
      </div>

      {/* Easter-egg map */}
      <div className="mx-auto mt-8 max-w-6xl px-6">
        <p className="mb-2 text-sm italic text-[var(--text-secondary)]">
          Explore all 68 stops →
        </p>
      </div>
      <div className="h-[70vh] w-full md:h-[500px]">
        <RoadTripMap />
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section>
              <h2 className="font-display text-2xl font-semibold">The story</h2>
              <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
                {trip.note}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">
                What was covered
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">
                {trip.activities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">
                By the numbers
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {NUMBERS.map((n) => (
                  <div
                    key={n.label}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
                  >
                    <div className="font-display text-2xl font-bold text-[var(--accent)]">
                      {n.value}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {n.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">
                From the journal
              </h2>
              {posts.length ? (
                <div className="mt-3 space-y-3">
                  {posts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/journal/${p.slug}`}
                      className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent)]"
                    >
                      <div className="text-xs text-[var(--text-secondary)]">
                        {p.date} · {p.readingTime}
                      </div>
                      <div className="font-display text-lg font-semibold">
                        {p.title}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[var(--text-secondary)]">
                  No entries yet — check back soon.
                </p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm">
              <h3 className="mb-3 font-display text-lg font-semibold">
                Quick stats
              </h3>
              <dl className="space-y-2 text-[var(--text-secondary)]">
                <div className="flex justify-between">
                  <dt>Stops</dt>
                  <dd className="text-[var(--text-primary)]">
                    {(stops as unknown[]).length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Days</dt>
                  <dd className="text-[var(--text-primary)]">{trip.days}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Countries</dt>
                  <dd className="text-[var(--text-primary)]">
                    {trip.countries.join(', ')}
                  </dd>
                </div>
              </dl>
            </div>

            <a
              href="https://na-roadtrip.vercel.app/roadtrip-legacy/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--accent)]"
            >
              Original trip app →
            </a>

            <a
              href="https://docs.google.com/spreadsheets/d/1uwrzmrQI8te-6ts9wagURRjzZee79p_GuMMlg6--8qM/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
            >
              Planning doc →
            </a>
          </aside>
        </div>
      </div>
    </div>
  )
}
