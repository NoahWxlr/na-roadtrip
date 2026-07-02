'use client'

import { useCallback, useEffect } from 'react'
import CloudinaryImage from './CloudinaryImage'
import type { Photo } from '@/lib/types'

export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: Photo[]
  index: number
  onClose: () => void
  onNavigate: (next: number) => void
}) {
  const photo = photos[index]

  const prev = useCallback(
    () => onNavigate((index - 1 + photos.length) % photos.length),
    [index, photos.length, onNavigate],
  )
  const next = useCallback(
    () => onNavigate((index + 1) % photos.length),
    [index, photos.length, onNavigate],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 text-2xl text-white/80 hover:text-white"
        aria-label="Close"
      >
        ✕
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 px-3 text-4xl text-white/70 hover:text-white"
        aria-label="Previous"
      >
        ‹
      </button>

      <div
        className="relative max-h-[80vh] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CloudinaryImage
          src={photo.id}
          alt={photo.caption}
          width={1600}
          height={1067}
          className="max-h-[80vh] w-full object-contain"
          sizes="100vw"
          priority
        />
        <div className="mt-3 text-center text-sm text-white/80">
          <span>{photo.caption}</span>
          {photo.location && (
            <span className="block italic text-white/50">{photo.location}</span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 px-3 text-4xl text-white/70 hover:text-white"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  )
}
