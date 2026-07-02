import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ThemeController from '@/components/ThemeController'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://milesandmeaning.vercel.app'),
  title: {
    template: '%s | Miles and Meaning',
    default: 'Miles and Meaning — A lifetime of travel stories',
  },
  description:
    'A 30-year travel plan, photography archive, and long-form journal documenting the world one trip at a time.',
  openGraph: {
    siteName: 'Miles and Meaning',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

// Set the theme before first paint to avoid a flash of the wrong background.
const themeScript = `(function(){var p=location.pathname;var dark=p==='/'||p.indexOf('/map')===0||p.indexOf('/plan')===0||p.indexOf('/trips/na-road-trip-2026')===0;document.body.dataset.theme=dark?'dark':'light';})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body data-theme="dark">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeController />
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
