import type { MetadataRoute } from 'next'
import { getTripSlugs } from '@/lib/trips'
import { getPostSlugs } from '@/lib/mdx'

const BASE = 'https://na-roadtrip.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/plan', '/map', '/journal', '/trips', '/photos', '/about']
  const tripRoutes = getTripSlugs().flatMap((s) => [`/trips/${s}`, `/photos/${s}`])
  const postRoutes = getPostSlugs().map((s) => `/journal/${s}`)

  return [...staticRoutes, ...tripRoutes, ...postRoutes].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }))
}
