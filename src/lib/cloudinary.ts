// Helpers for building Cloudinary delivery URLs outside of the <CldImage>
// component (e.g. for Open Graph metadata, where a plain URL is required).

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''

export const hasCloudinary = CLOUDINARY_CLOUD_NAME.length > 0

interface UrlOptions {
  width?: number
  height?: number
  crop?: string
}

export function getCloudinaryUrl(
  publicId: string | undefined,
  { width = 1200, height = 630, crop = 'fill' }: UrlOptions = {},
): string | undefined {
  if (!publicId || !hasCloudinary) return undefined
  const transforms = `f_auto,q_auto,c_${crop},w_${width},h_${height}`
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}
