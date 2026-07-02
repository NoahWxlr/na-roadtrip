import Link from 'next/link'
import { format } from 'date-fns'
import { getStats } from '@/lib/trips'
import { getLatestPost } from '@/lib/mdx'
import { REGION_LABELS } from '@/lib/regions'

export default function HomePage() {
  const stats = getStats()
  const latest = getLatestPost()

  const metrics = [
    { value: stats.total, label: 'trips planned' },
    { value: stats.continents, label: 'regions' },
    { value: stats.years, label: 'year horizon' },
    { value: stats.gapYears, label: 'gap years' },
  ]

  return (
    <div className="bg-[var(--bg)] text-[var(--text-primary)]">
      {/* HERO */}
      <section className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl md:text-7xl">
          Every place I&apos;ve ever
          <br className="hidden sm:block" /> wanted to go.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--text-secondary)]">
          A 30-year plan, a lifetime of stories.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/plan"
            className="rounded-full bg-[var(--accent)] px-7 py-3 font-medium text-black transition-opacity hover:opacity-90"
          >
            See the plan →
          </Link>
          <Link
            href="/journal"
            className="rounded-full border border-[var(--border)] px-7 py-3 font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
          >
            Read the journal →
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
            >
              <div className="font-display text-4xl font-bold text-[var(--accent)] md:text-5xl">
                {m.value}
              </div>
              <div className="mt-2 text-sm text-[var(--text-secondary)]">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST JOURNAL */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <h2 className="mb-6 font-display text-2xl font-semibold">
          From the journal
        </h2>
        {latest ? (
          <Link
            href={`/journal/${latest.slug}`}
            className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 transition-colors hover:border-[var(--accent)]"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span>{format(new Date(latest.date), 'MMMM d, yyyy')}</span>
              {latest.region && (
                <>
                  <span aria-hidden>·</span>
                  <span>{REGION_LABELS[latest.region]}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span>{latest.readingTime}</span>
            </div>
            <h3 className="font-display text-2xl font-bold">{latest.title}</h3>
            <p className="mt-3 text-[var(--text-secondary)]">
              {latest.excerpt.slice(0, 150)}
              {latest.excerpt.length > 150 ? '…' : ''}
            </p>
            <span className="mt-4 inline-block text-sm text-[var(--accent)]">
              Read more →
            </span>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--text-secondary)]">
            First entry coming soon.
          </div>
        )}
      </section>

      {/* ORIGIN STORY */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <Link
          href="/trips/na-road-trip-2026"
          className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-8 text-center italic text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
        >
          This all started with a 15,890-mile road trip across North America in
          2026. That trip became the foundation for a longer plan. →
        </Link>
      </section>
    </div>
  )
}
