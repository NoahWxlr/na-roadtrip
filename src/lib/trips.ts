import tripsData from '@/data/trips.json'
import planData from '@/data/plan.json'
import type { PlanYear, Trip } from './types'

export const trips = tripsData as unknown as Trip[]
export const plan = planData as unknown as PlanYear[]

const tripBySlug = new Map(trips.map((t) => [t.slug, t]))

export function getTrip(slug: string): Trip | undefined {
  return tripBySlug.get(slug)
}

export function getTrips(): Trip[] {
  return trips
}

export function getTripSlugs(): string[] {
  return trips.map((t) => t.slug)
}

export function getPlan(): PlanYear[] {
  return [...plan].sort((a, b) => a.year - b.year)
}

// Derived site-wide stats used across pages.
export function getStats() {
  const statusCounts = trips.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1
      return acc
    },
    {} as Record<Trip['status'], number>,
  )

  const continents = new Set(trips.map((t) => t.region)).size
  const gapYears = plan.filter((p) => p.gap).length
  const years = plan.length

  return {
    total: trips.length,
    visited: statusCounts.visited ?? 0,
    planned: statusCounts.planned ?? 0,
    dreaming: statusCounts.dreaming ?? 0,
    continents,
    gapYears,
    years,
  }
}
