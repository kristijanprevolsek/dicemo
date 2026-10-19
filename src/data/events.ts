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
export function sampleEvents(now = new Date()): CityEvent[] {
  const at = (dayOffset: number, hour: number, minute = 0) => {
    const d = new Date(now)
    d.setDate(d.getDate() + dayOffset)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }
  return [
    { id: 's1', title: 'Večer kantautora', category: 'koncert', start: at(0, 21), venue: 'Pogon kulture', place: 'Rijeka', price: '10 €' },
    { id: 's2', title: 'Opera – gostovanje', category: 'kazaliste', start: at(1, 19, 30), venue: 'HNK Ivana pl. Zajca', place: 'Rijeka', price: 'od 15 €' },
    { id: 's3', title: 'Prvenstvena utakmica', category: 'sport', start: at(2, 18), venue: 'Stadion Rujevica', place: 'Rijeka', price: 'od 8 €' },
    { id: 's4', title: 'Jazz na Korzu', category: 'koncert', start: at(2, 20), venue: 'Korzo', place: 'Rijeka', price: 'Besplatno' },
    { id: 's5', title: 'Sajam lokalnih proizvoda', category: 'dogadanje', start: at(3, 9), venue: 'Gradska tržnica', place: 'Rijeka', price: 'Besplatno' },
    { id: 's6', title: 'Komedija na čakavskom', category: 'kazaliste', start: at(3, 20), venue: 'Gradsko kazalište', place: 'Opatija', price: '12 €' },
    { id: 's7', title: 'Rukometna utakmica', category: 'sport', start: at(4, 19), venue: 'Dvorana Zamet', place: 'Rijeka', price: '5 €' },
    { id: 's8', title: 'Vođena šetnja Trsatom', category: 'dogadanje', start: at(5, 10), venue: 'Trsatska gradina', place: 'Rijeka', price: 'Besplatno' },
    { id: 's9', title: 'Koncert klasične glazbe', category: 'koncert', start: at(6, 20), venue: 'Villa Angiolina', place: 'Opatija', price: '15 €' },
    { id: 's10', title: 'Kestenijada', category: 'dogadanje', start: at(7, 11), venue: 'Stari grad', place: 'Kastav', price: 'Besplatno' },
    { id: 's11', title: 'Predstava za djecu', category: 'kazaliste', start: at(8, 11), venue: 'Gradsko kazalište lutaka', place: 'Rijeka', price: '6 €' },
    { id: 's12', title: 'Rock večer', category: 'koncert', start: at(9, 22), venue: 'Klub Palach', place: 'Rijeka', price: '8 €' },
  ]
}
