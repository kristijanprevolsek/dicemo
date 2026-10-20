import type { EventCategory } from '../data/events'

export type Category = 'sakralno' | 'povijest' | 'kultura' | 'more'

export const categoryLabels: Record<Category, string> = {
  sakralno: 'Sakralno',
  povijest: 'Povijest',
  kultura: 'Kultura',
  more: 'Voda i luka',
}

export interface Landmark {
  /** Jedinstven u svim gradovima (koristi se i za fotografije). */
  id: string
  name: string
  category: Category
  lat: number
  lng: number
  /** Udaljenost (m) na kojoj se korisniku nudi priča. */
  radius: number
  summary: string
  story: string[]
}

export interface WalkStop {
  landmarkId: string
  /** Kratka uputa kako doći do ove točke od prethodne. */
  hint?: string
}

export interface Walk {
  id: string
  title: string
  durationMin: number
  description: string
  stops: WalkStop[]
}

export interface QuizQuestion {
  question: string
  /** Prvi odgovor je točan; redoslijed se miješa pri prikazu. */
  options: [string, string, string]
}

/** Značka vezana uz skupinu znamenitosti određenog grada. */
export interface CityBadge {
  id: string
  icon: string
  title: string
  description: string
  landmarkIds: string[]
}

/** [dan od danas, sat, minuta, naslov, kategorija, mjesto održavanja, naselje, cijena] */
export type SampleEvent = [number, number, number, string, EventCategory, string, string, string]

export interface City {
  id: string
  name: string
  /** Za rečenice tipa „Skupi sve pečate u Rijeci“ */
  inName: string
  center: [number, number]
  zoom: number
  landmarks: Landmark[]
  walks: Walk[]
  quiz: Record<string, QuizQuestion>
  badges: CityBadge[]
  reward: { stamps: number; title: string }
  /** Primjer događanja dok se ne spoji pravi feed – nisu stvarna događanja. */
  sampleEvents: SampleEvent[]
}
