import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import { getPost, getPostSlugs, getAdjacentPosts } from '@/lib/mdx'
import { getTrip } from '@/lib/trips'
import { getCloudinaryUrl } from '@/lib/cloudinary'
import { REGION_LABELS } from '@/lib/regions'
import { RegionPill } from '@/components/ui'
import { mdxComponents } from '@/components/journal/mdx-components'
import CloudinaryImage from '@/components/photos/CloudinaryImage'

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const post = getPost(params.slug)
  if (!post) return {}
  const image = getCloudinaryUrl(post.heroPhoto)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
  }
}

export default function JournalPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const trip = post.tripSlug ? getTrip(post.tripSlug) : undefined
  const { prev, next } = getAdjacentPosts(post.slug)

  return (
    <article>
      {/* Full-bleed hero */}
      <header className="relative flex h-[60vh] min-h-[360px] w-full items-end overflow-hidden">
        {post.heroPhoto ? (
          <div className="absolute inset-0">
            <CloudinaryImage
              src={post.heroPhoto}
              alt={post.title}
              width={2400}
              height={1350}
              priority
              className="h-full w-full object-cover"
              sizes="100vw"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative mx-auto w-full max-w-4xl px-6 pb-10">
          <Link
            href="/journal"
            className="text-sm text-white/70 hover:text-white"
          >
            ← Journal
          </Link>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-white/80">
            {trip ? `${trip.name} · ` : ''}
            {format(new Date(post.date), 'MMMM d, yyyy')}
          </p>
        </div>
      </header>

      {/* Metadata bar */}
      <div className="mx-auto max-w-prose border-b border-[var(--border)] px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text-secondary)]">
          {post.region && <RegionPill region={post.region} />}
          {trip && (
            <Link href={`/trips/${trip.slug}`} className="hover:text-[var(--text-primary)]">
              {trip.name}
            </Link>
          )}
          <span>{post.readingTime}</span>
        </div>
      </div>

      {/* Body */}
      <div className="prose prose-lg mx-auto max-w-prose px-6 py-10 prose-headings:font-display prose-a:text-[var(--accent)] prose-blockquote:border-l-[var(--accent)]">
        <div className="dropcap">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: { rehypePlugins: [rehypeHighlight] },
            }}
          />
        </div>
      </div>

      {/* End matter */}
      <nav className="mx-auto flex max-w-prose justify-between gap-4 border-t border-[var(--border)] px-6 py-8 text-sm">
        {prev ? (
          <Link
            href={`/journal/${prev.slug}`}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/journal/${next.slug}`}
            className="text-right text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
