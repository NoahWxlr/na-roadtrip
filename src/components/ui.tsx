import { REGION_COLORS, REGION_LABELS, STATUS_COLORS, STATUS_LABELS } from '@/lib/regions'
import type { Region, TripStatus } from '@/lib/types'

export function Stars({ count }: { count: number }) {
  const clamped = Math.max(0, Math.min(5, count))
  return (
    <span
      className="text-[var(--accent)]"
      aria-label={`Intensity ${clamped} of 5`}
      title={`Intensity ${clamped} of 5`}
    >
      {'★'.repeat(clamped)}
      <span className="opacity-30">{'★'.repeat(5 - clamped)}</span>
    </span>
  )
}

export function RegionPill({ region }: { region: Region }) {
  const color = REGION_COLORS[region]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {REGION_LABELS[region]}
    </span>
  )
}

export function StatusBadge({ status }: { status: TripStatus }) {
  const color = STATUS_COLORS[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {STATUS_LABELS[status]}
    </span>
  )
}
