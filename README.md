# 🗺 NA Road Trip

Personal road trip reference site for a North America road trip — 52 stops, ~15,890 miles across the US, Canada, and back.

Built as a pure static site (HTML/CSS/JS, no build step) hosted on Vercel.

## Features

- **Optimized Route** — 68 stops in logical geographic order, eliminating backtracking
- **Interactive Filters** — filter by National Parks, Cities, Climbs, or Canada
- **Search** — fuzzy search across all stops
- **Permit Tracker** — all required permits with lottery links, costs, timing, and competition level
- **Recommendations** — additional spots not in the original plan, ranked by trip impact
- **Phase Overview** — 6 geographic phases with timing recommendations

## Stack

- Plain HTML, CSS, JavaScript — no framework, no build step
- Google Fonts (Playfair Display + DM Sans)
- Deployed on Vercel (free tier)

## Development

```bash
# Clone the repo
git clone https://github.com/noahwxlr/na-roadtrip.git
cd na-roadtrip

# Open locally — just open index.html in a browser
open index.html

# Or use a local dev server
npx serve .
```

## Deployment

Deployed automatically to Vercel on every push to `main`. No build configuration needed — Vercel serves the static files directly.

## License

MIT — open source, do whatever you want with it.
