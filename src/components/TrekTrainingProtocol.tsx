// The loaded-downhill training block that runs underneath every trek on the plan.
// It slots into the existing century-ride plan without replacing sessions — about
// 45–60 min added per week — and builds the one thing cycling and swimming can't:
// eccentric braking for long, loaded descents.

interface ProtocolDay {
  day: string
  summary: string
  items: { name: string; detail: string }[]
}

const PROTOCOL: ProtocolDay[] = [
  {
    day: 'Tuesday — strength finisher',
    summary: 'Added after the existing core work, ~15 min.',
    items: [
      {
        name: 'Eccentric step-down (priority #1)',
        detail:
          '3×15 per leg, 2–3×/week. From a 6–8" step, lower the other foot toward the floor over 4 seconds — don’t touch down, drive back up. The 4-second lowering is the entire point.',
      },
      {
        name: 'Lateral band walk',
        detail:
          '3×20 steps each direction, 2×/week. Trains the glute medius for uneven footplants on trail and scree — completely absent from cycling.',
      },
      {
        name: 'Single-leg calf raise (eccentric)',
        detail:
          '3×15 per foot, 2×/week. Rise on both feet, lower slowly on one over 4 seconds. Protects the Achilles and plantar fascia on consecutive descent days.',
      },
      {
        name: 'Copenhagen plank',
        detail:
          '3×20 sec each side, 2×/week. Adductor stability for lateral footplants on uneven ground.',
      },
      {
        name: 'Bulgarian split squats (already in the plan)',
        detail: 'Add a 3-second lowering tempo to existing reps — no new exercise, just eccentric-focused.',
      },
    ],
  },
  {
    day: 'Thursday — optional add-on',
    summary: '10 min after the endurance ride.',
    items: [
      {
        name: 'Loaded descent',
        detail:
          'Max-decline treadmill at 1.5–2 mph with a 15–20 lb vest (5 min on / 2 flat / 5 on), or a loaded stair descent in the building. Ride-fatigued legs make for a better late-day-descent simulation.',
      },
    ],
  },
  {
    day: 'Friday — loaded descent hike',
    summary: 'A named cross-training option.',
    items: [
      {
        name: 'Loaded descent hike',
        detail:
          'Find a hill with real descent (Sugarloaf MD, a Shenandoah trailhead). Walk up 30–45 min with a 20–25 lb vest or pack, then down slowly and deliberately — the descent is the workout. Progress +5 lb or +15 min each week.',
      },
      {
        name: 'Weekend double (once/month, pre-trek)',
        detail: 'Saturday hike + Sunday hike back-to-back.',
      },
    ],
  },
  {
    day: 'Saturday — occasional swap',
    summary: 'Months 3–5 of the century plan.',
    items: [
      {
        name: 'Loaded hike for the long ride',
        detail:
          'Once a month, swap the Saturday long ride for a 3–4 hr loaded hike. The aerobic stimulus is comparable; the eccentric load is not achievable on the bike.',
      },
    ],
  },
]

export default function TrekTrainingProtocol() {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl font-semibold">Loaded downhill protocol</h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
        The same descent-focused block runs underneath every trek on this plan. It slots into the
        existing century-ride training without replacing sessions — about 45–60 min added per week —
        and builds the one thing cycling and swimming can’t: eccentric braking for long, loaded
        descents.
      </p>
      <div className="mt-4 space-y-4">
        {PROTOCOL.map((d) => (
          <div
            key={d.day}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-display text-lg font-semibold">{d.day}</h3>
              <span className="text-xs text-[var(--text-secondary)]">{d.summary}</span>
            </div>
            <ul className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
              {d.items.map((item) => (
                <li key={item.name}>
                  <span className="font-medium text-[var(--text-primary)]">{item.name}.</span>{' '}
                  {item.detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
