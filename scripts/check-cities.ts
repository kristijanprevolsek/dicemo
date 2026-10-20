// Provjera ugrađenih podataka gradova: npm run check-cities
import { bundledCities } from '../src/cities'
import { validateCities } from '../src/cities/validate'

for (const city of bundledCities)
  console.log(`${city.name}: ${city.landmarks.length} znamenitosti, ${city.walks.length} šetnji, ${Object.keys(city.quiz).length} pitanja`)

const errors = validateCities(bundledCities)
if (errors.length) {
  console.error(`\n${errors.length} grešaka:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log('\nSve u redu.')
