import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-6xl font-bold text-[var(--accent)]">404</h1>
      <p className="mt-4 text-lg text-[var(--text-secondary)]">
        This road doesn&apos;t lead anywhere yet.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-[var(--border)] px-6 py-3 text-[var(--text-primary)] hover:border-[var(--accent)]"
      >
        Back home →
      </Link>
    </div>
  )
}
