import type { City } from '../cities/types'

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Id koji ne postoji ni u jednom gradu (id-evi znamenitosti moraju biti globalno jedinstveni). */
export function uniqueLandmarkId(base: string, cities: City[]): string {
  const taken = new Set(cities.flatMap((c) => c.landmarks.map((l) => l.id)))
  let id = base || 'znamenitost'
  for (let i = 2; taken.has(id); i++) id = `${base}-${i}`
  return id
}

export function uniqueId(base: string, taken: string[]): string {
  let id = base || 'novo'
  for (let i = 2; taken.includes(id); i++) id = `${base}-${i}`
  return id
}

export function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

export const newCity = (id: string, name: string, inName: string): City => ({
  id,
  name,
  inName,
  center: [45.1, 15.2],
  zoom: 15,
  landmarks: [],
  walks: [],
  quiz: {},
  badges: [],
  reward: { stamps: 5, title: 'Kava u partnerskom kafiću' },
  sampleEvents: [],
})
