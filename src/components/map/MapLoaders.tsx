'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type LocatorMap from './LocatorMap'

const loading = (
  <div className="flex h-full w-full items-center justify-center bg-[#0d0d0f] text-sm text-[#9a9a9f]">
    Loading map…
  </div>
)

export const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => loading,
})

export const RoadTripMap = dynamic(() => import('./RoadTripMap'), {
  ssr: false,
  loading: () => loading,
})

const LocatorMapDynamic = dynamic(() => import('./LocatorMap'), {
  ssr: false,
  loading: () => loading,
})

export function LocatorMapClient(props: ComponentProps<typeof LocatorMap>) {
  return <LocatorMapDynamic {...props} />
}
