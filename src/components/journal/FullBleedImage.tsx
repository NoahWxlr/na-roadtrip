import CloudinaryImage from '@/components/photos/CloudinaryImage'

export default function FullBleedImage({
  src,
  alt,
  caption,
  location,
}: {
  src: string
  alt: string
  caption?: string
  location?: string
}) {
  return (
    <figure className="full-bleed my-10">
      <CloudinaryImage
        src={src}
        alt={alt}
        width={2400}
        height={1350}
        className="max-h-[80vh] w-full object-cover"
        sizes="100vw"
      />
      {(caption || location) && (
        <figcaption className="mx-auto mt-2 max-w-prose px-6 text-right text-sm italic text-[var(--text-secondary)]">
          {caption}
          {location && <span> · {location}</span>}
        </figcaption>
      )}
    </figure>
  )
}
