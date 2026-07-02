import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/mdx'
import JournalList from '@/components/journal/JournalList'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes from the road — long-form writing tied to each trip.',
}

export default function JournalPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">Journal</h1>
      <p className="mb-10 mt-3 text-[var(--text-secondary)]">Notes from the road.</p>
      <JournalList posts={posts} />
    </div>
  )
}
