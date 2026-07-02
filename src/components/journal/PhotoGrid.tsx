import CloudinaryImage from '@/components/photos/CloudinaryImage'

interface GridImage {
  src: string
  alt: string
  caption?: string
}

export default function PhotoGrid({
  images,
  caption,
}: {
  images: GridImage[]
  caption?: string
}) {
  const cols = images.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  return (
    <figure className="my-8">
      <div className={`grid grid-cols-1 gap-3 ${cols}`}>
        {images.map((img) => (
          <div key={img.src} className="overflow-hidden rounded-xl">
            <CloudinaryImage
              src={img.src}
              alt={img.alt}
              width={800}
              height={600}
              className="aspect-[4/3] w-full object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            {img.caption && (
              <figcaption className="mt-1 text-xs italic text-[var(--text-secondary)]">
                {img.caption}
              </figcaption>
            )}
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-2 text-right text-sm italic text-[var(--text-secondary)]">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
