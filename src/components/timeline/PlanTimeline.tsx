'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { REGION_COLORS, REGION_LABELS, PLAN_FILTERS } from '@/lib/regions'
import type { PlanYear, Region, Trip } from '@/lib/types'
import { Stars } from '@/components/ui'

export default function PlanTimeline({
  plan,
  trips,
}: {
  plan: PlanYear[]
  trips: Trip[]
}) {
  const [filter, setFilter] = useState<'all' | Region>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const tripMap = useMemo(
    () => new Map(trips.map((t) => [t.slug, t])),
    [trips],
  )

  const matches = (t: Trip) => filter === 'all' || t.region === filter

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {PLAN_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? 'bg-[var(--accent)] text-black'
                : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {plan.map((row) => {
          const rowTrips = (row.trips ?? [])
            .map((s) => tripMap.get(s))
            .filter((t): t is Trip => Boolean(t))
          const visibleTrips = rowTrips.filter(matches)
          const dimmed = row.gap || (filter !== 'all' && visibleTrips.length === 0)

          return (
            <div
              key={row.year}
              className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-opacity ${
                dimmed ? 'opacity-50' : ''
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="w-20 shrink-0">
                  <div className="font-display text-xl font-bold">{row.year}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    age {row.age}
                  </div>
                </div>

                <div className="flex-1">
                  {row.gap ? (
                    <p className="italic text-[var(--text-secondary)]">
                      {row.gapReason}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {rowTrips.map((t) => {
                        const color = REGION_COLORS[t.region]
                        const isExpanded = expanded === t.slug
                        const faded = filter !== 'all' && !matches(t)
                        return (
                          <button
                            key={t.slug}
                            onClick={() =>
                              setExpanded(isExpanded ? null : t.slug)
                            }
                            className={`rounded-full px-3 py-1.5 text-sm transition-transform hover:scale-[1.02] ${
                              faded ? 'opacity-30' : ''
                            }`}
                            style={{
                              backgroundColor: `${color}26`,
                              color,
                              border: `1px solid ${color}66`,
                            }}
                          >
                            <span className="mr-1.5">
                              <Stars count={t.intensity} />
                            </span>
                            {t.name}
                            <span className="ml-1.5 opacity-70">
                              · {t.months}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Inline detail card */}
                  {rowTrips.map((t) =>
                    expanded === t.slug ? (
                      <div
                        key={`${t.slug}-detail`}
                        className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4"
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                          <span
                            className="rounded-full px-2 py-0.5"
                            style={{
                              backgroundColor: `${REGION_COLORS[t.region]}26`,
                              color: REGION_COLORS[t.region],
                            }}
                          >
                            {REGION_LABELS[t.region]}
                          </span>
                          <span>{t.days} days</span>
                          <span>{t.months}</span>
                          <span>
                            <Stars count={t.intensity} />
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {t.note}
                        </p>
                        <Link
                          href={`/trips/${t.slug}`}
                          className="mt-3 inline-block text-sm text-[var(--accent)]"
                        >
                          View trip →
                        </Link>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-10">
        <h2 className="mb-3 font-display text-lg font-semibold">Regions</h2>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(REGION_COLORS) as Region[]).map((r) => (
            <span
              key={r}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: REGION_COLORS[r] }}
              />
              {REGION_LABELS[r]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
