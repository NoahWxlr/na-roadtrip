'use client'

import { CldImage } from 'next-cloudinary'
import { hasCloudinary } from '@/lib/cloudinary'

interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  caption?: string
  location?: string
  priority?: boolean
  className?: string
  sizes?: string
}

// Wraps next-cloudinary's <CldImage>. When no Cloudinary cloud name is
// configured, renders a labelled placeholder so layouts stay intact in
// development and before the photo library is populated.
export default function CloudinaryImage({
  src,
  alt,
  width = 1200,
  height = 800,
  caption,
  location,
  priority,
  className = 'h-full w-full object-cover',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: Props) {
  if (!hasCloudinary) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-neutral-300 to-neutral-500 text-center text-xs text-white/80 ${className}`}
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-label={caption || alt}
      >
        <span className="px-2">{caption || alt}</span>
      </div>
    )
  }

  return (
    <CldImage
      src={src}
      width={width}
      height={height}
      alt={caption || alt}
      priority={priority}
      className={className}
      sizes={sizes}
      aria-label={caption || undefined}
    />
  )
}
