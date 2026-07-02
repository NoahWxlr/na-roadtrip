import type { Metadata } from 'next'
import Link from 'next/link'
import CloudinaryImage from '@/components/photos/CloudinaryImage'

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Noah — product designer, solo founder, and perpetual traveler, and the story behind this site.',
}

const GEAR = [
  { label: 'Camera', value: '[camera body]' },
  { label: 'Lenses', value: '[lens list]' },
  { label: 'Drone', value: '[drone model]' },
  { label: 'Action cam', value: 'GoPro' },
  { label: 'Editing', value: 'Lightroom / Capture One' },
]

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <header className="relative flex h-[60vh] min-h-[360px] w-full items-end overflow-hidden">
        <div className="absolute inset-0">
          <CloudinaryImage
            src="travel/about/hero"
            alt="Noah on the road"
            width={2400}
            height={1350}
            priority
            className="h-full w-full object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-10">
          <h1 className="font-display text-5xl font-bold text-white md:text-7xl">
            Noah
          </h1>
          <p className="mt-2 text-white/80">
            Product designer. Solo founder. Perpetual traveler.
          </p>
        </div>
      </header>

      {/* About + gear (light) */}
      <section className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <p className="leading-relaxed text-[var(--text-secondary)]">
            I&apos;m Noah — a product designer, solo founder, and lifelong
            traveler. This site is my travel archive: a 30-year plan, a growing
            photo library, and long-form writing from the road.
          </p>
          <p className="leading-relaxed text-[var(--text-secondary)]">
            It started with a book — <em>Vagabonding</em> by Rolf Potts — read in
            college, and a dream of a road trip that took years to execute. In
            2026 that dream became 15,890 miles across North America, and that
            trip became the springboard for a lifetime plan.
          </p>
          <p className="leading-relaxed text-[var(--text-secondary)]">
            The design background shows in how this site is built: every layout
            decision, typography pairing, and component was deliberately chosen.
            This project is as much a design artifact as it is a travel log.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="https://noahwxlr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-80"
            >
              See my product design work →
            </a>
          </div>
          <div className="flex flex-wrap gap-4 pt-2 text-sm text-[var(--text-secondary)]">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-primary)]"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Gear</h2>
          <dl className="space-y-3 text-sm">
            {GEAR.map((g) => (
              <div key={g.label}>
                <dt className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                  {g.label}
                </dt>
                <dd className="text-[var(--text-primary)]">{g.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      {/* Plan callout (dark, explicit palette) */}
      <section className="bg-[#0d0d0f] text-[#f0ede8]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            A 30-year plan
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#9a9a9f]">
            Thirty-seven trips across three decades — epic treks, road-trip
            loops, and slow returns to the places worth seeing twice. Mapped out,
            year by year, from now to age 62.
          </p>
          <Link
            href="/plan"
            className="mt-8 inline-block rounded-full bg-[#e8c97e] px-7 py-3 font-medium text-black hover:opacity-90"
          >
            See the full plan →
          </Link>
        </div>
      </section>

      {/* Connect (light) */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold">
          Found something interesting here?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--text-secondary)]">
          I&apos;m open to collaborations, sponsorships, and route
          recommendations. Reach out any time.
        </p>
        <a
          href="mailto:noahwxlr@gmail.com"
          className="mt-6 inline-block text-[var(--accent)] hover:opacity-80"
        >
          noahwxlr@gmail.com
        </a>
      </section>
    </div>
  )
}
