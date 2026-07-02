'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { STATUS_COLORS } from '@/lib/regions'
import type { TripStatus } from '@/lib/types'

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

export default function LocatorMap({
  coords,
  name,
  status,
}: {
  coords: [number, number]
  name: string
  status: TripStatus
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: coords,
      zoom: 4,
      scrollWheelZoom: false,
      zoomControl: true,
    })
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map)
    const color = STATUS_COLORS[status]
    L.marker(coords, {
      icon: L.divIcon({
        className: '',
        html: `<span class="trip-marker" style="display:block;width:18px;height:18px;background:${color}"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
    })
      .bindPopup(`<strong>${name}</strong>`)
      .addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [coords, name, status])

  return <div ref={containerRef} className="h-full w-full" />
}
