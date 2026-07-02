import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTrip, getTrips } from '@/lib/trips'
import { getPhotos } from '@/lib/photos'
import { getCloudinaryUrl } from '@/lib/cloudinary'
import CloudinaryImage from '@/components/photos/CloudinaryImage'
import PhotoGallery from '@/components/photos/PhotoGallery'

export function generateStaticParams() {
  return getTrips().map((t) => ({ slug: t.slug }))
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
    title: `${trip.name} — photos`,
    description: `Photo gallery from ${trip.name}.`,
    openGraph: image
      ? { images: [{ url: image, width: 1200, height: 630 }] }
      : undefined,
  }
}

export default function TripGalleryPage({
  params,
}: {
  params: { slug: string }
}) {
  const trip = getTrip(params.slug)
  if (!trip) notFound()

  const photos = getPhotos(trip.slug)

  return (
    <div>
      {/* Full-bleed hero */}
      <header className="relative flex h-[50vh] min-h-[320px] w-full items-end overflow-hidden">
        {trip.heroPhoto ? (
          <div className="absolute inset-0">
            <CloudinaryImage
              src={trip.heroPhoto}
              alt={trip.name}
              width={2400}
              height={1350}
              priority
              className="h-full w-full object-cover"
              sizes="100vw"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-500 to-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-8">
          <Link href="/photos" className="text-sm text-white/70 hover:text-white">
            ← Photography
          </Link>
          <h1 className="mt-2 font-display text-4xl font-bold text-white md:text-6xl">
            {trip.name}
          </h1>
          <p className="mt-1 text-sm text-white/80">
            {trip.year} · {trip.countries.join(', ')}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <PhotoGallery photos={photos} />
      </div>
    </div>
  )
}
