import type { City } from './types'

/** Provjera sadržaja gradova. Vraća popis grešaka (prazan = sve u redu). */
export function validateCities(cities: City[]): string[] {
  const errors: string[] = []
  const seen = new Map<string, string>()
  const cityIds = new Set<string>()

  for (const city of cities) {
    if (cityIds.has(city.id)) errors.push(`Grad s id-em "${city.id}" postoji dvaput`)
    cityIds.add(city.id)
    if (!city.name.trim()) errors.push(`${city.id}: grad nema ime`)
    if (!city.landmarks.length) errors.push(`${city.name}: dodaj barem jednu znamenitost`)

    const ids = new Set(city.landmarks.map((l) => l.id))
    for (const l of city.landmarks) {
      const where = `${city.name} → ${l.name || l.id}`
      if (seen.has(l.id)) errors.push(`${where}: id "${l.id}" već postoji (${seen.get(l.id)})`)
      seen.set(l.id, city.name)
      if (!l.name.trim()) errors.push(`${city.name}: znamenitost "${l.id}" nema ime`)
      if (!l.story.some((p) => p.trim())) errors.push(`${where}: nema priče`)
      if (Math.abs(l.lat - city.center[0]) > 0.3 || Math.abs(l.lng - city.center[1]) > 0.3)
        errors.push(`${where}: predaleko od središta grada – provjeri lokaciju`)
      const q = city.quiz[l.id]
      if (!q) errors.push(`${where}: nema pitanje za kviz`)
      else if (!q.question.trim() || q.options.some((o) => !o.trim())) errors.push(`${where}: pitanje ili odgovori nisu popunjeni`)
    }
    for (const id of Object.keys(city.quiz)) if (!ids.has(id)) errors.push(`${city.name}: pitanje za nepostojeću znamenitost "${id}"`)
    for (const w of city.walks) {
      if (w.stops.length < 2) errors.push(`${city.name} → šetnja "${w.title}": treba barem dvije točke`)
      for (const s of w.stops) if (!ids.has(s.landmarkId)) errors.push(`${city.name} → šetnja "${w.title}": nepostojeća točka "${s.landmarkId}"`)
    }
    for (const b of city.badges) {
      if (!b.landmarkIds.length) errors.push(`${city.name} → značka "${b.title}": nema odabranih znamenitosti`)
      for (const id of b.landmarkIds) if (!ids.has(id)) errors.push(`${city.name} → značka "${b.title}": nepostojeća znamenitost "${id}"`)
    }
    if (city.reward.stamps > city.landmarks.length) errors.push(`${city.name}: nagrada traži više pečata nego što ima znamenitosti`)
  }
  return errors
}
