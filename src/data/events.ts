import type { City } from '../cities/types'

export type EventCategory = 'koncert' | 'kazaliste' | 'sport' | 'dogadanje'

export interface CityEvent {
  id: string
  title: string
  category: EventCategory
  /** ISO 8601 s vremenskom zonom, npr. 2026-10-21T20:00:00+02:00 */
  start: string
  venue: string
  /** Mjesto: Rijeka, Opatija, Kastav… */
  place: string
  price?: string
  url?: string
  description?: string
}

export const eventCategoryLabels: Record<EventCategory, string> = {
  koncert: 'Koncerti',
  kazaliste: 'Kazalište',
  sport: 'Sport',
  dogadanje: 'Događanja',
}

export const DAYS_AHEAD = 10

/**
 * Primjer podataka dok se ne spoji pravi izvor (vidi README → Događanja).
 * Datumi se računaju od današnjeg dana kako bi popis uvijek bio pun.
 * Ovo NISU stvarna događanja.
 */
export function sampleEvents(city: City, now = new Date()): CityEvent[] {
  return city.sampleEvents.map(([day, hour, minute, title, category, venue, place, price], i) => {
    const d = new Date(now)
    d.setDate(d.getDate() + day)
    d.setHours(hour, minute, 0, 0)
    return { id: `${city.id}-s${i}`, title, category, start: d.toISOString(), venue, place, price }
  })
}
