// Provjera podataka gradova: npm run check-cities
import { cities } from '../src/cities'

const errors: string[] = []
const seen = new Map<string, string>()

for (const city of cities) {
  const ids = new Set(city.landmarks.map((l) => l.id))
  for (const l of city.landmarks) {
    if (seen.has(l.id)) errors.push(`${city.id}: id "${l.id}" već postoji u gradu ${seen.get(l.id)}`)
    seen.set(l.id, city.id)
    if (Math.abs(l.lat - city.center[0]) > 0.3 || Math.abs(l.lng - city.center[1]) > 0.3)
      errors.push(`${city.id}: "${l.id}" je predaleko od središta grada – provjeri koordinate`)
  }
  for (const w of city.walks)
    for (const s of w.stops) if (!ids.has(s.landmarkId)) errors.push(`${city.id}: šetnja "${w.id}" → nepoznata točka "${s.landmarkId}"`)
  for (const id of Object.keys(city.quiz)) if (!ids.has(id)) errors.push(`${city.id}: pitanje za nepoznatu znamenitost "${id}"`)
  for (const l of city.landmarks) if (!city.quiz[l.id]) errors.push(`${city.id}: "${l.id}" nema pitanje za kviz`)
  for (const b of city.badges)
    for (const id of b.landmarkIds) if (!ids.has(id)) errors.push(`${city.id}: značka "${b.id}" → nepoznata znamenitost "${id}"`)
  if (city.reward.stamps > city.landmarks.length) errors.push(`${city.id}: nagrada traži više pečata nego što ima znamenitosti`)
  console.log(`${city.name}: ${city.landmarks.length} znamenitosti, ${city.walks.length} šetnji, ${Object.keys(city.quiz).length} pitanja`)
}

if (errors.length) {
  console.error(`\n${errors.length} grešaka:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log('\nSve u redu.')
