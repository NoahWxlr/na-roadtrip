import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTrip, getTrips } from '@/lib/trips'
import { getPostsForTrip } from '@/lib/mdx'
import { REGION_LABELS } from '@/lib/regions'
import { getCloudinaryUrl } from '@/lib/cloudinary'
import { Stars, RegionPill, StatusBadge } from '@/components/ui'
import GoogleMapEmbed from '@/components/map/GoogleMapEmbed'
import TrekTrainingProtocol from '@/components/TrekTrainingProtocol'

// The NA road trip has its own dedicated route; exclude it here.
export function generateStaticParams() {
  return getTrips()
    .filter((t) => t.slug !== 'na-road-trip-2026')
    .map((t) => ({ slug: t.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const trip = getTrip(params.slug)
  if (!trip) return {}
  const image = getCloudinaryUrl(trip.heroPhoto)
  return {
    title: trip.name,
    description: trip.note,
    openGraph: {
      title: trip.name,
      description: trip.note,
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
  }
}

export default function TripPage({ params }: { params: { slug: string } }) {
  const trip = getTrip(params.slug)
  if (!trip) notFound()

  const posts = getPostsForTrip(trip.slug)

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/trips" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        ← All trips
      </Link>

      {/* Hero */}
      <header className="mt-6">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          {trip.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <RegionPill region={trip.region} />
          <StatusBadge status={trip.status} />
          <Stars count={trip.intensity} />
        </div>
        <div className="mt-3 text-sm text-[var(--text-secondary)]">
          {trip.year} · {trip.months} · {trip.days} days · {trip.countries.join(', ')}
        </div>
      </header>

      {/* Full-width map */}
      <div className="mt-8 h-[340px] overflow-hidden rounded-2xl border border-[var(--border)] md:h-[440px]">
        <GoogleMapEmbed coords={trip.coords} name={trip.name} />
      </div>

      {/* Body */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section>
            <h2 className="font-display text-2xl font-semibold">Overview</h2>
            <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
              {trip.note}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Activities</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">
              {trip.activities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Best time</h2>
            <p className="mt-3 text-[var(--text-secondary)]">{trip.bestTime}</p>
          </section>

          {trip.fitnessBridge && trip.fitnessBridge.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">Fitness bridge</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">
                {trip.fitnessBridge.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </section>
          )}

          {trip.trainingPlan && trip.trainingPlan.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">Training plan</h2>
              <div className="mt-3 space-y-4">
                {trip.trainingPlan.map((phase) => (
                  <div
                    key={phase.phase}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="font-display text-lg font-semibold">
                        {phase.phase}
                      </h3>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {phase.timeframe}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {phase.focus}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                      {phase.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {trip.trainingPlan && trip.trainingPlan.length > 0 && (
            <TrekTrainingProtocol />
          )}

          {trip.gearChecklist && trip.gearChecklist.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">Gear checklist</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {trip.gearChecklist.map((cat) => (
                  <div
                    key={cat.category}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      {cat.category}
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                      {cat.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {trip.communities && trip.communities.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">Communities & resources</h2>
              <ul className="mt-3 space-y-2 text-[var(--text-secondary)]">
                {trip.communities.map((c) => (
                  <li key={c.name}>
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--accent)] hover:underline"
                      >
                        {c.name}
                      </a>
                    ) : (
                      <span className="font-medium text-[var(--text-primary)]">{c.name}</span>
                    )}
                    {c.note ? ` — ${c.note}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">From the journal</h2>
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
                    <p className="text-sm text-[var(--text-secondary)]">
                      {p.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[var(--text-secondary)]">
                No entries yet — check back after the trip.
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
                <dt>Days</dt>
                <dd className="text-[var(--text-primary)]">{trip.days}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Intensity</dt>
                <dd>
                  <Stars count={trip.intensity} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Region</dt>
                <dd className="text-[var(--text-primary)]">
                  {REGION_LABELS[trip.region]}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Best time</dt>
                <dd className="text-right text-[var(--text-primary)]">
                  {trip.bestTime}
                </dd>
              </div>
            </dl>
          </div>

          {trip.planningDoc && (
            <a
              href={trip.planningDoc}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
            >
              Planning doc →
            </a>
          )}
        </aside>
      </div>
    </div>
  )
}
