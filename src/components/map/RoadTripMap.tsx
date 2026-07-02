'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import stops from '@/data/na-roadtrip-stops.json'
import type { RoadTripStop } from '@/lib/types'

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

// Colours preserved from the original static site (app.js TYPE_COLORS).
const CATEGORY_COLORS: Record<string, string> = {
  'national-park': '#6db56d',
  city: '#5b9fd4',
  climb: '#c8a84b',
}

function stopColor(s: RoadTripStop) {
  return CATEGORY_COLORS[s.category] ?? '#9a9a9f'
}

function stopIcon(s: RoadTripStop) {
  const color = stopColor(s)
  return L.divIcon({
    className: '',
    html: `<span class="trip-marker" style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:${color};color:#0d0d0f;font-size:10px;font-weight:700">${s.stopNumber}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
}

export default function RoadTripMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const data = stops as unknown as RoadTripStop[]

    const map = L.map(containerRef.current, {
      center: [44, -100],
      zoom: 4,
      scrollWheelZoom: false,
    })
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map)

    // Dashed route polyline connecting stops in order.
    const latlngs = data.map((s) => [s.lat, s.lng] as [number, number])
    L.polyline(latlngs, {
      color: '#e8c97e',
      weight: 2,
      opacity: 0.7,
      dashArray: '6 8',
    }).addTo(map)

    // Markers.
    data.forEach((s) => {
      const permit = s.permit
        ? '<br/><span style="color:#c8a84b;font-size:11px">Permit required</span>'
        : ''
      const popup = `
        <div style="min-width:180px">
          <span style="color:#9a9a9f;font-size:11px">Stop ${s.stopNumber} · ${s.state}</span><br/>
          <strong style="font-size:14px">${s.name}</strong><br/>
          <span style="color:#c9c9cf;font-size:12px">${s.description}</span>${permit}
        </div>`
      L.marker([s.lat, s.lng], { icon: stopIcon(s) })
        .bindPopup(popup)
        .addTo(map)
    })

    map.fitBounds(L.latLngBounds(latlngs).pad(0.1))
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="h-full w-full" />
}
