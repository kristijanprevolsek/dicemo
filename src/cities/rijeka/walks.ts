import type { Walk } from '../types'

export const walks: Walk[] = [
  {
    id: 'rijeka-60',
    title: 'Rijeka u 60 minuta',
    durationMin: 60,
    description:
      'Najkraći put kroz srce grada: od tržnice i kazališta preko Korza do Staroga grada, rimskog luka i katedrale sv. Vida.',
    stops: [
      { landmarkId: 'trznica', hint: 'Počni kod ribarnice i razgledaj paviljone.' },
      { landmarkId: 'hnk-zajc', hint: 'Kazalište je odmah uz tržnicu.' },
      { landmarkId: 'gradski-toranj', hint: 'Prošeći do Korza i nađi toranj sa satom.' },
      { landmarkId: 'kosi-toranj', hint: 'Prođi ispod tornja u Stari grad i potraži Veliku crkvu.' },
      { landmarkId: 'stara-vrata', hint: 'Rimski luk je nekoliko koraka dalje, među kućama Staroga grada.' },
      { landmarkId: 'katedrala-sv-vida', hint: 'Nastavi do trga Grivica i okrugle crkve.' },
    ],
  },
  {
    id: 'trsat',
    title: 'Trsat: stube, svetište i gradina',
    durationMin: 90,
    description:
      'Hodočasnički uspon Kružićevim stubama do najstarijeg hrvatskog marijanskog svetišta i Frankopanske gradine s pogledom na cijeli Kvarner.',
    stops: [
      { landmarkId: 'trsatske-stube', hint: 'Stube počinju uz Titov trg, kod Rječine.' },
      { landmarkId: 'gospa-trsatska', hint: 'Penji se stubama do vrha – uzmi vremena i vodu.' },
      { landmarkId: 'trsatska-gradina', hint: 'Gradina je nekoliko minuta hoda od svetišta.' },
    ],
  },
]
