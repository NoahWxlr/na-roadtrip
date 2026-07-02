import fs from 'node:fs'
import path from 'node:path'
import type { Photo } from './types'
import { trips } from './trips'

const PHOTOS_DIR = path.join(process.cwd(), 'src', 'data', 'photos')

export function getPhotos(slug: string): Photo[] {
  const file = path.join(PHOTOS_DIR, `${slug}.json`)
  if (!fs.existsSync(file)) return []
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Photo[]
  } catch {
    return []
  }
}

// All featured photos across every trip, each tagged with its trip slug,
// for the /photos portfolio index.
export function getFeaturedPhotos(): (Photo & { tripSlug: string })[] {
  return trips.flatMap((trip) =>
    getPhotos(trip.slug)
      .filter((p) => p.featured)
      .map((p) => ({ ...p, tripSlug: trip.slug })),
  )
}

export function getTripsWithPhotos(): string[] {
  return trips.filter((t) => getPhotos(t.slug).length > 0).map((t) => t.slug)
}
