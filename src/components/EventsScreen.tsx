import { useEffect, useMemo, useState } from 'react'
import { eventCategoryLabels, DAYS_AHEAD, type CityEvent, type EventCategory } from '../data/events'
import { dayKey, dayLabel, loadEvents, timeLabel } from '../lib/events'

type Area = 'sve' | 'rijeka' | 'okolica'
const areaLabels: Record<Area, string> = { sve: 'Sve', rijeka: 'Rijeka', okolica: 'Okolica' }

export function EventsScreen() {
  const [events, setEvents] = useState<CityEvent[] | null>(null)
  const [isSample, setIsSample] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<EventCategory | null>(null)
  const [area, setArea] = useState<Area>('sve')

  useEffect(() => {
    loadEvents()
      .then((r) => {
        setEvents(r.events)
        setIsSample(r.isSample)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Greška pri učitavanju.'))
  }, [])

  const groups = useMemo(() => {
    const filtered = (events ?? []).filter(
      (e) =>
        (!category || e.category === category) &&
        (area === 'sve' || (area === 'rijeka') === (e.place === 'Rijeka')),
    )
    const byDay = new Map<string, CityEvent[]>()
    for (const e of filtered) {
      const k = dayKey(e.start)
      byDay.set(k, [...(byDay.get(k) ?? []), e])
    }
    return [...byDay.entries()]
  }, [events, category, area])

  return (
    <div className="screen">
      <header className="screen-header">
        <h1 className="brand brand-small">Događanja</h1>
        <p className="muted small">Rijeka i okolica · sljedećih {DAYS_AHEAD} dana</p>

        <div className="chips" role="group" aria-label="Kategorija">
          <button className={`filter${!category ? ' filter-on' : ''}`} onClick={() => setCategory(null)}>Sve</button>
          {(Object.keys(eventCategoryLabels) as EventCategory[]).map((c) => (
            <button
              key={c}
              className={`filter filter-${c}${category === c ? ' filter-on' : ''}`}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {eventCategoryLabels[c]}
            </button>
          ))}
        </div>
        <div className="segmented" role="group" aria-label="Područje">
          {(Object.keys(areaLabels) as Area[]).map((a) => (
            <button key={a} className={area === a ? 'on' : ''} onClick={() => setArea(a)}>
              {areaLabels[a]}
            </button>
          ))}
        </div>
      </header>

      <div className="screen-body">
        {isSample && (
          <p className="notice">Primjer podataka – ovo nisu stvarna događanja. Pravi izvor spaja se preko feeda (vidi README).</p>
        )}
        {error && <p className="error">{error}</p>}
        {!events && !error && <p className="muted">Učitavam…</p>}
        {events && groups.length === 0 && <p className="muted">Nema događanja za odabrane filtere.</p>}

        {groups.map(([day, items]) => (
          <section key={day} className="day">
            <h2 className="day-title">{dayLabel(day)}</h2>
            {items.map((e) => (
              <article key={e.id} className={`event event-${e.category}`}>
                <div className="event-time">{timeLabel(e.start)}</div>
                <div className="event-main">
                  <span className="event-cat">{eventCategoryLabels[e.category]}</span>
                  <h3>{e.title}</h3>
                  <p className="muted small">
                    {e.venue}
                    {e.place !== 'Rijeka' && ` · ${e.place}`}
                    {e.price && ` · ${e.price}`}
                  </p>
                  {e.description && <p className="small">{e.description}</p>}
                </div>
                {e.url && (
                  <a className="btn btn-secondary btn-small" href={e.url} target="_blank" rel="noreferrer">
                    Više
                  </a>
                )}
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
