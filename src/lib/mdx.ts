import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { JournalPost, Region } from './types'

const JOURNAL_DIR = path.join(process.cwd(), 'content', 'journal')

function ensureDir(): boolean {
  return fs.existsSync(JOURNAL_DIR)
}

function readPost(fileName: string): JournalPost {
  const slug = fileName.replace(/\.mdx?$/, '')
  const raw = fs.readFileSync(path.join(JOURNAL_DIR, fileName), 'utf8')
  const { data, content } = matter(raw)

  const excerpt =
    (data.excerpt as string) ??
    content.trim().replace(/[#>*_`]/g, '').slice(0, 160).trim() + '…'

  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? '1970-01-01',
    tripSlug: data.tripSlug as string | undefined,
    region: data.region as Region | undefined,
    excerpt,
    readingTime: readingTime(content).text,
    heroPhoto: data.heroPhoto as string | undefined,
    content,
  }
}

export function getAllPosts(): JournalPost[] {
  if (!ensureDir()) return []
  return fs
    .readdirSync(JOURNAL_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(readPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): JournalPost | undefined {
  if (!ensureDir()) return undefined
  const file = ['.mdx', '.md']
    .map((ext) => `${slug}${ext}`)
    .find((f) => fs.existsSync(path.join(JOURNAL_DIR, f)))
  return file ? readPost(file) : undefined
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug)
}

export function getPostsForTrip(tripSlug: string): JournalPost[] {
  return getAllPosts().filter((p) => p.tripSlug === tripSlug)
}

export function getLatestPost(): JournalPost | undefined {
  return getAllPosts()[0]
}

// Adjacent posts (by date order) for the prev/next navigation on a post page.
export function getAdjacentPosts(slug: string): {
  prev?: JournalPost
  next?: JournalPost
} {
  const posts = getAllPosts()
  const idx = posts.findIndex((p) => p.slug === slug)
  if (idx === -1) return {}
  return {
    // posts are newest-first; "next entry" is the newer one
    next: idx > 0 ? posts[idx - 1] : undefined,
    prev: idx < posts.length - 1 ? posts[idx + 1] : undefined,
  }
}
