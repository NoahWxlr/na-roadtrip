'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { REGION_LABELS } from '@/lib/regions'
import { RegionPill } from '@/components/ui'
import type { JournalPost, Region } from '@/lib/types'

export default function JournalList({ posts }: { posts: JournalPost[] }) {
  const [filter, setFilter] = useState<'all' | Region>('all')

  const regions = useMemo(
    () =>
      Array.from(
        new Set(posts.map((p) => p.region).filter(Boolean)),
      ) as Region[],
    [posts],
  )

  const filtered = posts.filter((p) => filter === 'all' || p.region === filter)

  if (!posts.length) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <div className="mb-3 h-3 w-24 rounded bg-[var(--border)]" />
              <div className="mb-2 h-6 w-3/4 rounded bg-[var(--border)]" />
              <div className="h-4 w-full rounded bg-[var(--border)]" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[var(--text-secondary)]">
          First entries will appear here once the journey begins.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            filter === 'all'
              ? 'bg-[var(--accent)] text-white'
              : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          All
        </button>
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === r
                ? 'bg-[var(--accent)] text-white'
                : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {REGION_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filtered.map((p) => (
          <Link
            key={p.slug}
            href={`/journal/${p.slug}`}
            className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-shadow hover:shadow-lg"
          >
            <div className="mb-2 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span>{format(new Date(p.date), 'MMM d, yyyy')}</span>
              {p.region && <RegionPill region={p.region} />}
            </div>
            <h2 className="font-display text-2xl font-bold">{p.title}</h2>
            <p className="mt-2 flex-1 text-[var(--text-secondary)]">
              {p.excerpt}
            </p>
            <span className="mt-4 text-sm text-[var(--accent)]">Read →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
