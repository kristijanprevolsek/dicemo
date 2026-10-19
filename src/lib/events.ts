import { DAYS_AHEAD, sampleEvents, type CityEvent } from '../data/events'

const FEED_URL = import.meta.env.VITE_EVENTS_FEED_URL

export interface EventsResult {
  events: CityEvent[]
  /** true dok se prikazuju primjeri umjesto pravog izvora */
  isSample: boolean
}

/**
 * Učitava događanja u sljedećih DAYS_AHEAD dana. Izvor je JSON feed (polje CityEvent
 * objekata) koji puni pozadinski agregator. Bez feeda vraća primjer podataka.
 */
export async function loadEvents(now = new Date()): Promise<EventsResult> {
  let events: CityEvent[]
  let isSample = false
  if (FEED_URL) {
    const res = await fetch(FEED_URL)
    if (!res.ok) throw new Error(`Feed događanja nije dostupan (${res.status})`)
    events = await res.json()
  } else {
    events = sampleEvents(now)
    isSample = true
  }

  const from = new Date(now)
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + DAYS_AHEAD)

  return {
    isSample,
    events: events
      .filter((e) => {
        const t = new Date(e.start)
        return t >= from && t < to
      })
      .sort((a, b) => a.start.localeCompare(b.start)),
  }
}

/** Ključ dana (YYYY-MM-DD) u lokalnoj vremenskoj zoni. */
export function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dayLabel(key: string, now = new Date()): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  if (diff === 0) return 'Danas'
  if (diff === 1) return 'Sutra'
  const s = date.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })
}
