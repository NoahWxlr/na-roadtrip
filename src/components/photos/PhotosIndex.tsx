'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import CloudinaryImage from './CloudinaryImage'
import { REGION_LABELS } from '@/lib/regions'
import type { Region } from '@/lib/types'

export interface IndexPhoto {
  id: string
  caption: string
  location: string
  tripSlug: string
  tripName: string
  region: Region
}

export default function PhotosIndex({ photos }: { photos: IndexPhoto[] }) {
  const [filter, setFilter] = useState<'all' | Region>('all')

  const regions = useMemo(
    () => Array.from(new Set(photos.map((p) => p.region))) as Region[],
    [photos],
  )

  const filtered = photos.filter((p) => filter === 'all' || p.region === filter)

  if (!photos.length) {
    return (
      <p className="py-16 text-center text-[var(--text-secondary)]">
        The photo library is coming soon. Featured images from each trip will
        appear here.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1.5 text-sm ${
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
            className={`rounded-full px-4 py-1.5 text-sm ${
              filter === r
                ? 'bg-[var(--accent)] text-white'
                : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {REGION_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/photos/${p.tripSlug}`}
            className="group relative block w-full overflow-hidden rounded-xl"
          >
            <CloudinaryImage
              src={p.id}
              alt={p.caption}
              width={800}
              height={600}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="text-left text-white">
                <div className="text-sm font-medium">{p.tripName}</div>
                <div className="text-xs italic text-white/70">{p.location}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
