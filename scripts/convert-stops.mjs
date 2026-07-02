// Converts the legacy `STOPS` array from the old static site (data.js)
// into src/data/na-roadtrip-stops.json.
//
// Legacy shape: { num, name, state, lat, lng, type, permit, canada, sub,
//                 highlights, camping, elev, climate, seasonNote, miles, hrs, ... }
// Target shape: { stopNumber, name, state, lat, lng, category, permit, canada,
//                 description, highlights, miles, hrs }
//
// Run with: npm run convert:stops

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const legacyPath = resolve(root, 'public/roadtrip-legacy/data.js')
const outPath = resolve(root, 'src/data/na-roadtrip-stops.json')

const src = readFileSync(legacyPath, 'utf8')

// The legacy file declares top-level consts; expose them via a Function sandbox.
const extract = new Function(
  `${src}; return { STOPS, PERMITS, RECS_HIGH, RECS_MED };`
)
const { STOPS } = extract()

// category maps the legacy `type` to the spec's category field.
const CATEGORY = { np: 'national-park', city: 'city', climb: 'climb' }

const stops = STOPS.map((s) => ({
  stopNumber: s.num,
  name: s.name,
  state: s.state ?? '',
  lat: s.lat,
  lng: s.lng,
  category: CATEGORY[s.type] ?? s.type ?? 'stop',
  legacyType: s.type ?? null,
  permit: Boolean(s.permit),
  canada: Boolean(s.canada),
  description: s.sub ?? '',
  highlights: Array.isArray(s.highlights) ? s.highlights : [],
  miles: s.miles ?? null,
  hrs: s.hrs ?? null,
  elev: s.elev ?? null,
  climate: s.climate ?? null,
}))

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(stops, null, 2) + '\n')

console.log(`Wrote ${stops.length} stops -> ${outPath}`)
