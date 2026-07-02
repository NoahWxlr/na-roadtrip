import type { Region } from './types'

export const REGION_COLORS: Record<Region, string> = {
  asia: '#2a78d6',
  south_am: '#1baf7a',
  trek: '#e34948',
  nordic: '#eda100',
  europe: '#8b5cf6',
  na: '#eb6834',
  mea: '#888780',
  oceania: '#e87ba4',
}

export const REGION_LABELS: Record<Region, string> = {
  asia: 'Asia',
  south_am: 'South America',
  trek: 'Epic treks',
  nordic: 'Nordic / Polar',
  europe: 'Europe',
  na: 'NA loops',
  mea: 'Middle East / Africa',
  oceania: 'Oceania',
}

// The subset of region filters shown as top-level buttons on the plan page.
export const PLAN_FILTERS: { key: 'all' | Region; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'trek', label: 'Epic treks' },
  { key: 'na', label: 'NA loops' },
  { key: 'europe', label: 'Europe' },
  { key: 'nordic', label: 'Nordic / Polar' },
  { key: 'south_am', label: 'South America' },
]

export const STATUS_COLORS = {
  visited: '#22c55e',
  planned: '#3b82f6',
  dreaming: '#9ca3af',
} as const

export const STATUS_LABELS = {
  visited: 'Visited',
  planned: 'Planned',
  dreaming: 'Dreaming',
} as const
