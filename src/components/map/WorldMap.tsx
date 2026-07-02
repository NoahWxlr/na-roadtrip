'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { getTrips } from '@/lib/trips'
import { STATUS_COLORS } from '@/lib/regions'
import type { TripStatus } from '@/lib/types'

const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

type Filter = 'all' | TripStatus

function markerIcon(status: TripStatus) {
  const color = STATUS_COLORS[status]
  return L.divIcon({
    className: '',
    html: `<span class="trip-marker" style="display:block;width:16px;height:16px;background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  })
}

export default function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [panelOpen, setPanelOpen] = useState(false)

  const trips = useMemo(() => getTrips(), [])
  const counts = useMemo(
    () => ({
      visited: trips.filter((t) => t.status === 'visited').length,
      planned: trips.filter((t) => t.status === 'planned').length,
      dreaming: trips.filter((t) => t.status === 'dreaming').length,
    }),
    [trips],
  )

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [30, 5],
      zoom: 2,
      minZoom: 2,
      worldCopyJump: true,
      scrollWheelZoom: true,
    })
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  // Draw / redraw markers when the filter changes.
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    trips
      .filter((t) => filter === 'all' || t.status === filter)
      .forEach((t) => {
        const popup = `
          <div style="min-width:160px">
            <strong style="font-size:14px">${t.name}</strong><br/>
            <span style="color:#9a9a9f;font-size:12px">${t.year} · ${t.days} days</span><br/>
            <a href="/trips/${t.slug}" style="color:#e8c97e;font-size:12px">View trip →</a>
          </div>`
        L.marker([t.coords[0], t.coords[1]], { icon: markerIcon(t.status) })
          .bindPopup(popup)
          .addTo(layer)
      })
  }, [filter, trips])

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'visited', label: 'Visited' },
    { key: 'planned', label: 'Planned' },
    { key: 'dreaming', label: 'Dreaming' },
  ]

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Mobile toggle */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className="absolute left-3 top-3 z-[1000] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-lg md:hidden"
      >
        Filters
      </button>

      {/* Controls panel */}
      <div
        className={`absolute left-3 top-3 z-[999] w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur ${
          panelOpen ? 'block' : 'hidden'
        } md:block`}
      >
        <p className="mb-3 font-display text-sm font-semibold text-[var(--text-primary)]">
          Filter by status
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                filter === f.key
                  ? 'bg-[var(--accent)] text-black'
                  : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          <span style={{ color: STATUS_COLORS.visited }}>
            {counts.visited} visited
          </span>{' '}
          ·{' '}
          <span style={{ color: STATUS_COLORS.planned }}>
            {counts.planned} planned
          </span>{' '}
          ·{' '}
          <span style={{ color: STATUS_COLORS.dreaming }}>
            {counts.dreaming} dreaming
          </span>
        </p>
      </div>
    </div>
  )
}
