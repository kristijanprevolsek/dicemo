import type { City } from '../types'
import { landmarks } from './landmarks'
import { quiz } from './quiz'
import { walks } from './walks'

export const rijeka: City = {
  id: 'rijeka',
  name: 'Rijeka',
  inName: 'u Rijeci',
  center: [45.3271, 14.4422],
  zoom: 15,
  landmarks,
  walks,
  quiz,
  badges: [
    {
      id: 'stari-grad',
      icon: '🏰',
      title: 'Stari grad',
      description: 'Toranj, kosi toranj, Stara vrata i katedrala.',
      landmarkIds: ['gradski-toranj', 'kosi-toranj', 'stara-vrata', 'katedrala-sv-vida'],
    },
    {
      id: 'hodocasnik',
      icon: '⛪',
      title: 'Trsatski hodočasnik',
      description: 'Stube, svetište i gradina na Trsatu.',
      landmarkIds: ['trsatske-stube', 'gospa-trsatska', 'trsatska-gradina'],
    },
    { id: 'uz-more', icon: '⚓', title: 'Uz more', description: 'Molo longo i lansirna stanica torpeda.', landmarkIds: ['molo-longo', 'torpedo'] },
  ],
  reward: { stamps: 10, title: 'Kava u partnerskom kafiću' },
  sampleEvents: [
    [0, 21, 0, 'Večer kantautora', 'koncert', 'Pogon kulture', 'Rijeka', '10 €'],
    [1, 19, 30, 'Opera – gostovanje', 'kazaliste', 'HNK Ivana pl. Zajca', 'Rijeka', 'od 15 €'],
    [2, 18, 0, 'Prvenstvena utakmica', 'sport', 'Stadion Rujevica', 'Rijeka', 'od 8 €'],
    [2, 20, 0, 'Jazz na Korzu', 'koncert', 'Korzo', 'Rijeka', 'Besplatno'],
    [3, 9, 0, 'Sajam lokalnih proizvoda', 'dogadanje', 'Gradska tržnica', 'Rijeka', 'Besplatno'],
    [3, 20, 0, 'Komedija na čakavskom', 'kazaliste', 'Gradsko kazalište', 'Opatija', '12 €'],
    [4, 19, 0, 'Rukometna utakmica', 'sport', 'Dvorana Zamet', 'Rijeka', '5 €'],
    [5, 10, 0, 'Vođena šetnja Trsatom', 'dogadanje', 'Trsatska gradina', 'Rijeka', 'Besplatno'],
    [6, 20, 0, 'Koncert klasične glazbe', 'koncert', 'Villa Angiolina', 'Opatija', '15 €'],
    [7, 11, 0, 'Kestenijada', 'dogadanje', 'Stari grad', 'Kastav', 'Besplatno'],
    [8, 11, 0, 'Predstava za djecu', 'kazaliste', 'Gradsko kazalište lutaka', 'Rijeka', '6 €'],
    [9, 22, 0, 'Rock večer', 'koncert', 'Klub Palach', 'Rijeka', '8 €'],
  ],
}
