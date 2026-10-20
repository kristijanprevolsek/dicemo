import { distanceMeters, type Position } from '../lib/geo'
import { osijek } from './osijek'
import { rijeka } from './rijeka'
import type { City } from './types'
import { zagreb } from './zagreb'

/**
 * Sadržaj ugrađen u aplikaciju. Služi kao početni sadržaj i rezerva kad baza nije dostupna;
 * izmjene iz admin sučelja (src/admin) ga nadjačavaju.
 */
export const bundledCities: City[] = [rijeka, zagreb, osijek]

/** Grad u čijoj je blizini korisnik (do 25 km od središta), ili null. */
export function nearestCity(pos: Position, cities: City[], maxMeters = 25_000): City | null {
  let best: { city: City; d: number } | null = null
  for (const city of cities) {
    const d = distanceMeters(pos, { lat: city.center[0], lng: city.center[1] })
    if (d <= maxMeters && (!best || d < best.d)) best = { city, d }
  }
  return best?.city ?? null
}
