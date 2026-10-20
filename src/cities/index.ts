import { distanceMeters, type Position } from '../lib/geo'
import type { City, CityInfo } from './types'

/**
 * Sadržaj ugrađen u aplikaciju. Svaki grad je zaseban dio koda (dynamic import) koji se
 * preuzima tek kad ga korisnik odabere, pa veličina aplikacije ne raste s brojem gradova.
 * Sažeci u `info` moraju odgovarati sadržaju – provjerava ih `npm run check-cities`.
 * Izmjene iz admin sučelja (src/admin) nadjačavaju ugrađeni sadržaj.
 */
export const bundledCatalog: { info: CityInfo; load: () => Promise<City> }[] = [
  {
    info: { id: 'rijeka', name: 'Rijeka', inName: 'u Rijeci', center: [45.3271, 14.4422], landmarks: 13, walks: 2 },
    load: () => import('./rijeka').then((m) => m.rijeka),
  },
  {
    info: { id: 'zagreb', name: 'Zagreb', inName: 'u Zagrebu', center: [45.8135, 15.9765], landmarks: 9, walks: 1 },
    load: () => import('./zagreb').then((m) => m.zagreb),
  },
  {
    info: { id: 'osijek', name: 'Osijek', inName: 'u Osijeku', center: [45.5605, 18.684], landmarks: 6, walks: 1 },
    load: () => import('./osijek').then((m) => m.osijek),
  },
]

export const isBundledCity = (id: string) => bundledCatalog.some((c) => c.info.id === id)

export function loadBundledCity(id: string): Promise<City> | null {
  return bundledCatalog.find((c) => c.info.id === id)?.load() ?? null
}

/** Grad u čijoj je blizini korisnik (do 25 km od središta), ili null. */
export function nearestCity(pos: Position, cities: CityInfo[], maxMeters = 25_000): CityInfo | null {
  let best: { city: CityInfo; d: number } | null = null
  for (const city of cities) {
    const d = distanceMeters(pos, { lat: city.center[0], lng: city.center[1] })
    if (d <= maxMeters && (!best || d < best.d)) best = { city, d }
  }
  return best?.city ?? null
}
