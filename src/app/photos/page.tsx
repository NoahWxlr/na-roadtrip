import type { Metadata } from 'next'
import { getFeaturedPhotos } from '@/lib/photos'
import { getTrip } from '@/lib/trips'
import PhotosIndex, { type IndexPhoto } from '@/components/photos/PhotosIndex'

export const metadata: Metadata = {
  title: 'Photography',
  description: 'A photography archive from a lifetime of travel.',
}

export default function PhotosPage() {
  const featured = getFeaturedPhotos()
  const photos: IndexPhoto[] = featured.flatMap((p) => {
    const trip = getTrip(p.tripSlug)
    if (!trip) return []
    return [
      {
        id: p.id,
        caption: p.caption,
        location: p.location,
        tripSlug: p.tripSlug,
        tripName: trip.name,
        region: trip.region,
      },
    ]
  })

  const tripCount = new Set(photos.map((p) => p.tripSlug)).size

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">Photography</h1>
      <p className="mb-10 mt-3 text-[var(--text-secondary)]">
        {photos.length} featured frames across {tripCount}{' '}
        {tripCount === 1 ? 'trip' : 'trips'}.
      </p>
      <PhotosIndex photos={photos} />
    </div>
  )
}
