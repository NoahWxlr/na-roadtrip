export type Region =
  | 'asia'
  | 'south_am'
  | 'trek'
  | 'nordic'
  | 'europe'
  | 'na'
  | 'mea'
  | 'oceania'

export type TripStatus = 'visited' | 'planned' | 'dreaming'

export interface Trip {
  slug: string
  name: string
  region: Region
  status: TripStatus
  year: number
  months: string
  intensity: number
  days: number
  countries: string[]
  coords: [number, number]
  note: string
  activities: string[]
  bestTime: string
  isEasterEgg?: boolean
  easterEggNote?: string
  heroPhoto?: string
  photoCount?: number
  featuredPhotos?: string[]
}

export interface PlanYear {
  year: number
  age: number
  gap: boolean
  gapReason?: string
  trips?: string[]
}

export interface RoadTripStop {
  stopNumber: number
  name: string
  state: string
  lat: number
  lng: number
  category: string
  legacyType: string | null
  permit: boolean
  canada: boolean
  description: string
  highlights: string[]
  miles: string | null
  hrs: string | null
  elev: number | null
  climate: string | null
}

export interface JournalPost {
  slug: string
  title: string
  date: string
  tripSlug?: string
  region?: Region
  excerpt: string
  readingTime: string
  heroPhoto?: string
  content: string
}

export interface Photo {
  id: string
  caption: string
  location: string
  date?: string
  featured?: boolean
  tags?: string[]
}
