# 🌍 Noah travels

Lifetime travel planner, photography archive, and long-form journal — a 30-year
plan, an interactive world map, and a magazine-style travel blog.

Rebuilt from the original NA Road Trip static site (now preserved as an easter
egg at `/trips/na-road-trip-2026`).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a two-mode token system (dark for map/plan, light editorial for journal/photos)
- **Leaflet.js** + CartoDB Dark Matter tiles for all maps
- **MDX** journal via `next-mdx-remote` (no CMS) — content in `content/journal/`
- **Cloudinary** (`next-cloudinary`) for the photography system
- All trip/plan data in JSON under `src/data/` — no database

## Routes

| Route | Theme | Description |
|-------|-------|-------------|
| `/` | dark | Home — hero, stats, latest journal entry, origin story |
| `/plan` | dark | 30-year interactive timeline |
| `/map` | dark | World map, color-coded by status |
| `/journal`, `/journal/[slug]` | light | Journal index + magazine article layout |
| `/trips`, `/trips/[slug]` | light | Trip directory + detail with locator map |
| `/trips/na-road-trip-2026` | dark | The 68-stop easter-egg road-trip map |
| `/photos`, `/photos/[slug]` | light | Photography portfolio + trip galleries |
| `/about` | light/dark | About + gear + origin story |
| `/roadtrip` | — | Redirects to `/trips/na-road-trip-2026` |

## Development

```bash
npm install
cp .env.local.example .env.local   # add your Cloudinary cloud name (optional)
npm run dev                         # http://localhost:3000
npm run build                       # production build (statically generates all pages)
```

## Data

- `src/data/trips.json` — 37 trips (region, status, coords, intensity, notes…)
- `src/data/plan.json` — the year-by-year 30-year plan
- `src/data/na-roadtrip-stops.json` — the 68 road-trip stops (generated from the
  legacy site via `npm run convert:stops`)
- `src/data/photos/[slug].json` — per-trip photo metadata (Cloudinary public IDs)

## Legacy

The original static site lives under `public/roadtrip-legacy/` for reference and
is linked from the road-trip page as "Original trip app →".

## Deployment

Auto-deploys to Vercel from `main`. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in the
Vercel project's environment variables to enable real photography.

## License

MIT
