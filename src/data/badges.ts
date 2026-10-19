import { landmarks } from './landmarks'

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

export const badges: Badge[] = [
  { id: 'prvi-pecat', icon: '🏁', title: 'Prvi pečat', description: 'Posjeti prvu znamenitost.', progress: (p) => [Math.min(p.visited.length, 1), 1] },
  {
    id: 'stari-grad',
    icon: '🏰',
    title: 'Stari grad',
    description: 'Toranj, kosi toranj, Stara vrata i katedrala.',
    progress: countOf(['gradski-toranj', 'kosi-toranj', 'stara-vrata', 'katedrala-sv-vida']),
  },
  {
    id: 'hodocasnik',
    icon: '⛪',
    title: 'Trsatski hodočasnik',
    description: 'Stube, svetište i gradina na Trsatu.',
    progress: countOf(['trsatske-stube', 'gospa-trsatska', 'trsatska-gradina']),
  },
  { id: 'uz-more', icon: '⚓', title: 'Uz more', description: 'Molo longo i lansirna stanica torpeda.', progress: countOf(['molo-longo', 'torpedo']) },
  {
    id: 'znalac',
    icon: '🎓',
    title: 'Znalac',
    description: 'Točno odgovori na 5 pitanja iz prve.',
    progress: (p) => [Math.min(Object.values(p.quiz).filter(Boolean).length, 5), 5],
  },
  { id: 'setac', icon: '🚶', title: 'Šetač', description: 'Završi jednu tematsku šetnju.', progress: (p) => [Math.min(p.walks.length, 1), 1] },
  { id: 'vodic', icon: '🏆', title: 'Riječki vodič', description: 'Skupi sve pečate u Rijeci.', progress: countOf(landmarks.map((l) => l.id)) },
]

export const isEarned = (b: Badge, p: Progress) => {
  const [done, total] = b.progress(p)
  return done >= total
}

/** Primjer nagrade – partneri (kafići, muzeji) još nisu dogovoreni. */
export const REWARD = { stamps: 10, title: 'Kava u partnerskom kafiću' }
