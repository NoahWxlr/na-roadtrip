'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Dark sections: home, map, plan, and the NA road-trip easter egg page.
// Everything else (journal, trips, photos, about) uses the light editorial theme.
const DARK_PREFIXES = ['/map', '/plan', '/trips/na-road-trip-2026']

function themeFor(pathname: string): 'dark' | 'light' {
  if (pathname === '/') return 'dark'
  return DARK_PREFIXES.some((p) => pathname.startsWith(p)) ? 'dark' : 'light'
}

export default function ThemeController() {
  const pathname = usePathname()

  useEffect(() => {
    document.body.dataset.theme = themeFor(pathname)
  }, [pathname])

  return null
}
