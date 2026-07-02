'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const EXPLORE = [
  { href: '/plan', label: 'Plan' },
  { href: '/map', label: 'Map' },
  { href: '/trips', label: 'Trips' },
]

const LINKS = [
  { href: '/journal', label: 'Journal' },
  { href: '/photos', label: 'Photos' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const linkClass = (active: boolean) =>
    `text-sm transition-colors ${
      active
        ? 'text-[var(--text-primary)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text-primary)]"
          onClick={() => setMobileOpen(false)}
        >
          <span aria-hidden className="text-[var(--accent)]">
            ◍
          </span>
          Noah travels
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setExploreOpen(true)}
            onMouseLeave={() => setExploreOpen(false)}
          >
            <button
              className={linkClass(EXPLORE.some((l) => isActive(l.href)))}
              onClick={() => setExploreOpen((v) => !v)}
              aria-expanded={exploreOpen}
            >
              Explore ▾
            </button>
            {exploreOpen && (
              <div className="absolute left-0 top-full min-w-[9rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl">
                {EXPLORE.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(isActive(l.href))}>
              {l.label}
            </Link>
          ))}

          <a
            href="https://noahwxlr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--accent)] hover:opacity-80"
          >
            Portfolio →
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-[var(--text-primary)] md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="text-2xl">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-3 md:hidden">
          {[...EXPLORE, ...LINKS].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-3 text-base ${linkClass(isActive(l.href))}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://noahwxlr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 text-base text-[var(--accent)]"
          >
            Portfolio →
          </a>
        </div>
      )}
    </nav>
  )
}
