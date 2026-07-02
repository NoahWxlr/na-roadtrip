import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Token references — resolved via CSS custom properties (see globals.css)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        accent: 'var(--accent)',
        // Region palette (from the plan widget)
        region: {
          asia: '#2a78d6',
          south_am: '#1baf7a',
          trek: '#e34948',
          nordic: '#eda100',
          europe: '#8b5cf6',
          na: '#eb6834',
          mea: '#888780',
          oceania: '#e87ba4',
        },
        // Status palette (world map)
        status: {
          visited: '#22c55e',
          planned: '#3b82f6',
          dreaming: '#9ca3af',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '720px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
