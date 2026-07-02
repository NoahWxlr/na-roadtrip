import { Children } from 'react'
import CloudinaryImage from '@/components/photos/CloudinaryImage'

interface GridImage {
  src: string
  alt: string
  caption?: string
}

// A single cell inside <PhotoGrid> — used as a child in MDX:
//   <PhotoGrid>
//     <GridImage src="..." alt="..." caption="..." />
//   </PhotoGrid>
export function GridImage({ src, alt, caption }: GridImage) {
  return (
    <div className="overflow-hidden rounded-xl">
      <CloudinaryImage
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="aspect-[4/3] w-full object-cover"
        sizes="(max-width: 640px) 100vw, 33vw"
      />
      {caption && (
        <figcaption className="mt-1 text-xs italic text-[var(--text-secondary)]">
          {caption}
        </figcaption>
      )}
    </div>
  )
}

export default function PhotoGrid({
  children,
  images,
  caption,
}: {
  children?: React.ReactNode
  images?: GridImage[]
  caption?: string
}) {
  // Support both a children-based API (MDX) and an images-array API (programmatic).
  const cells = children
    ? Children.toArray(children)
    : (images ?? []).map((img) => <GridImage key={img.src} {...img} />)

  if (!cells.length) return null
  const cols = cells.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'

  return (
    <figure className="my-8">
      <div className={`grid grid-cols-1 gap-3 ${cols}`}>{cells}</div>
      {caption && (
        <figcaption className="mt-2 text-right text-sm italic text-[var(--text-secondary)]">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
