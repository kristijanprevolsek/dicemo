import { distanceMeters, type Position } from '../lib/geo'
import { osijek } from './osijek'
import { rijeka } from './rijeka'
import type { City } from './types'
import { zagreb } from './zagreb'

/** Novi grad: napravi mapu u src/cities/<grad>/ po uzoru na postojeće i dodaj ga ovdje. */
export const cities: City[] = [rijeka, zagreb, osijek]

export const DEFAULT_CITY = rijeka

export function getCity(id: string | null | undefined): City {
  return cities.find((c) => c.id === id) ?? DEFAULT_CITY
}

/** Grad u čijoj je blizini korisnik (do 25 km od središta), ili null. */
export function nearestCity(pos: Position, maxMeters = 25_000): City | null {
  let best: { city: City; d: number } | null = null
  for (const city of cities) {
    const d = distanceMeters(pos, { lat: city.center[0], lng: city.center[1] })
    if (d <= maxMeters && (!best || d < best.d)) best = { city, d }
  }
  return best?.city ?? null
}
