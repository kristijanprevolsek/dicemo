import type { City } from '../cities/types'

export interface Progress {
  visited: string[]
  /** id znamenitosti → je li prvi odgovor bio točan */
  quiz: Record<string, boolean>
  walks: string[]
}

export interface Badge {
  id: string
  icon: string
  title: string
  description: string
  /** [ostvareno, potrebno] */
  progress: (p: Progress) => [number, number]
}

const countOf = (ids: string[]) => (p: Progress): [number, number] => [
  ids.filter((id) => p.visited.includes(id)).length,
  ids.length,
]

/** Opće značke (iste u svakom gradu) + značke specifične za grad. */
export function badgesFor(city: City): Badge[] {
  return [
    { id: 'prvi-pecat', icon: '🏁', title: 'Prvi pečat', description: 'Posjeti prvu znamenitost.', progress: (p) => [Math.min(p.visited.length, 1), 1] },
    ...city.badges.map((b) => ({ ...b, progress: countOf(b.landmarkIds) })),
    {
      id: 'znalac',
      icon: '🎓',
      title: 'Znalac',
      description: 'Točno odgovori na 5 pitanja iz prve.',
      progress: (p) => [Math.min(Object.values(p.quiz).filter(Boolean).length, 5), 5],
    },
    { id: 'setac', icon: '🚶', title: 'Šetač', description: 'Završi jednu tematsku šetnju.', progress: (p) => [Math.min(p.walks.length, 1), 1] },
    {
      id: 'vodic',
      icon: '🏆',
      title: `Vodič: ${city.name}`,
      description: `Skupi sve pečate ${city.inName}.`,
      progress: countOf(city.landmarks.map((l) => l.id)),
    },
  ]
}

export const isEarned = (b: Badge, p: Progress) => {
  const [done, total] = b.progress(p)
  return done >= total
}
