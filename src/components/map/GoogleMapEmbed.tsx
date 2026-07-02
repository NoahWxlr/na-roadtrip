import type { CSSProperties } from 'react'

// A keyless Google Maps embed — no API key or billing required. Renders an
// interactive Google map centered on the given coordinates with a pin.
export default function GoogleMapEmbed({
  coords,
  name,
  zoom = 6,
  className,
  style,
}: {
  coords: [number, number]
  name: string
  zoom?: number
  className?: string
  style?: CSSProperties
}) {
  const [lat, lng] = coords
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=en&output=embed`

  return (
    <iframe
      title={`Map of ${name}`}
      src={src}
      className={className ?? 'h-full w-full'}
      style={{ border: 0, ...style }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
