import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTrip, getTrips } from '@/lib/trips'
import { getPostsForTrip } from '@/lib/mdx'
import { REGION_LABELS } from '@/lib/regions'
import { getCloudinaryUrl } from '@/lib/cloudinary'
import { Stars, RegionPill, StatusBadge } from '@/components/ui'
import GoogleMapEmbed from '@/components/map/GoogleMapEmbed'

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
