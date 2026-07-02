'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { REGION_COLORS, REGION_LABELS } from '@/lib/regions'
import type { Region, Trip, TripStatus } from '@/lib/types'
import { Stars, StatusBadge } from '@/components/ui'

type Filter = 'all' | TripStatus | Region
type Sort = 'year' | 'region' | 'intensity'

export default function TripsGrid({ trips }: { trips: Trip[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('year')

  const regions = useMemo(
    () => Array.from(new Set(trips.map((t) => t.region))) as Region[],
    [trips],
  )

  const filtered = useMemo(() => {
    const list = trips.filter((t) => {
      if (filter === 'all') return true
      if (filter === 'visited' || filter === 'planned' || filter === 'dreaming')
        return t.status === filter
      return t.region === filter
    })
    return [...list].sort((a, b) => {
      if (sort === 'year') return a.year - b.year
      if (sort === 'intensity') return b.intensity - a.intensity
      return a.region.localeCompare(b.region) || a.year - b.year
    })
  }, [trips, filter, sort])

  const filterBtn = (key: Filter, label: string) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        filter === key
          ? 'bg-[var(--accent)] text-white'
          : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filterBtn('all', 'All')}
        {filterBtn('visited', 'Visited')}
        {filterBtn('planned', 'Planned')}
        {filterBtn('dreaming', 'Dreaming')}
        {regions.map((r) => filterBtn(r, REGION_LABELS[r]))}
      </div>

      <div className="mb-8 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <span>Sort:</span>
        {(['year', 'region', 'intensity'] as Sort[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`capitalize ${
              sort === s
                ? 'font-medium text-[var(--text-primary)] underline'
                : 'hover:text-[var(--text-primary)]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Link
            key={t.slug}
            href={`/trips/${t.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-shadow hover:shadow-lg"
          >
            <div
              className="h-1"
              style={{ backgroundColor: REGION_COLORS[t.region] }}
            />
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-display text-xl font-bold leading-snug group-hover:text-[var(--accent)]">
                  {t.name}
                </h3>
                {t.isEasterEgg && (
                  <span title="Full 68-stop map inside" aria-hidden>
                    ✦
                  </span>
                )}
              </div>
              <div className="mb-3 text-xs text-[var(--text-secondary)]">
                {t.year} · {t.months} · {t.days} days
              </div>
              <div className="mb-3">
                <Stars count={t.intensity} />
              </div>
              <p className="mb-4 text-sm text-[var(--text-secondary)]">
                {t.countries.join(' · ')}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <StatusBadge status={t.status} />
                <span className="text-sm text-[var(--accent)]">
                  View details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
