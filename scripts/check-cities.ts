// Provjera ugrađenih podataka gradova: npm run check-cities
import { bundledCatalog } from '../src/cities'
import { infoOf } from '../src/cities/types'
import { validateCities } from '../src/cities/validate'

const cities = await Promise.all(bundledCatalog.map((c) => c.load()))
const errors = validateCities(cities)

for (const [i, city] of cities.entries()) {
  console.log(`${city.name}: ${city.landmarks.length} znamenitosti, ${city.walks.length} šetnji, ${Object.keys(city.quiz).length} pitanja`)
  // Sažetak u katalogu (src/cities/index.ts) mora odgovarati sadržaju grada.
  const expected = JSON.stringify(infoOf(city))
  if (JSON.stringify(bundledCatalog[i].info) !== expected)
    errors.push(`${city.id}: sažetak u src/cities/index.ts ne odgovara sadržaju – treba biti ${expected}`)
}

if (errors.length) {
  console.error(`\n${errors.length} grešaka:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log('\nSve u redu.')
