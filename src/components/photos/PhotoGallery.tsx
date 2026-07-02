'use client'

import { useState } from 'react'
import CloudinaryImage from './CloudinaryImage'
import PhotoLightbox from './PhotoLightbox'
import type { Photo } from '@/lib/types'

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!photos.length) {
    return (
      <p className="py-16 text-center text-[var(--text-secondary)]">
        Photos coming soon.
      </p>
    )
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightbox(i)}
            className={`group relative block w-full overflow-hidden rounded-xl ${
              photo.featured ? 'lg:[break-inside:avoid]' : ''
            }`}
          >
            <CloudinaryImage
              src={photo.id}
              alt={photo.caption}
              width={800}
              height={photo.featured ? 1000 : 600}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="text-left text-white">
                <div className="text-sm font-medium">{photo.caption}</div>
                {photo.location && (
                  <div className="text-xs italic text-white/70">
                    {photo.location}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <PhotoLightbox
          photos={photos}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      )}
    </>
  )
}
