import type { Metadata } from 'next'
import { WorldMap } from '@/components/map/MapLoaders'

export const metadata: Metadata = {
  title: 'World map',
  description:
    'An interactive world map of every trip — visited, planned, and dreaming.',
}

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-65px)] w-full">
      <WorldMap />
    </div>
  )
}
