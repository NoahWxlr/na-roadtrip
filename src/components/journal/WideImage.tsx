import CloudinaryImage from '@/components/photos/CloudinaryImage'

export default function WideImage({
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
    <figure className="my-8 w-full">
      <CloudinaryImage
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        className="w-full rounded-xl object-cover"
        sizes="(max-width: 768px) 100vw, 80vw"
      />
      {(caption || location) && (
        <figcaption className="mt-2 text-right text-sm italic text-[var(--text-secondary)]">
          {caption}
          {location && <span> · {location}</span>}
        </figcaption>
      )}
    </figure>
  )
}
