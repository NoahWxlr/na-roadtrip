import Link from 'next/link'

const LINKS = [
  { href: '/plan', label: 'Plan' },
  { href: '/map', label: 'Map' },
  { href: '/journal', label: 'Journal' },
  { href: '/trips', label: 'Trips' },
  { href: '/photos', label: 'Photos' },
  { href: '/about', label: 'About' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-8 text-sm md:flex-row md:justify-between">
        <p className="text-center md:text-left">
          Noah&apos;s world · Built with Next.js + Leaflet
        </p>

        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-[var(--text-primary)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-center md:text-right">
          <a
            href="https://github.com/NoahWxlr/na-roadtrip"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)]"
          >
            GitHub
          </a>
          <span className="opacity-60">Deployed on Vercel</span>
        </div>
      </div>
    </footer>
  )
}
