import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { bundledCities } from '../cities'
import type { City } from '../cities/types'
import { db } from '../lib/firebase'

/**
 * Izvor sadržaja gradova.
 * - firestore: kolekcija `cities/{id}` s poljem `json` (cijeli City kao JSON – Firestore ne
 *   podržava ugniježđena polja, a ovako je i lako izvesti/uvesti). Uređuju urednici iz
 *   kolekcije `editors/{uid}`, vidi firestore.rules.
 * - local (demo, bez Firebasea): izmjene se spremaju u localStorage ovog preglednika.
 * U oba slučaja izmjene nadjačavaju ugrađeni sadržaj (src/cities) po id-u grada.
 */
export interface ContentRepo {
  kind: 'firestore' | 'local'
  load(): Promise<City[]>
  save(city: City, editorUid?: string): Promise<void>
  remove(cityId: string): Promise<void>
  /** Gradovi koje korisnik smije uređivati ('*' = svi); null = nije urednik. */
  editableCities(uid: string): Promise<string[] | null>
}

const LOCAL_KEY = 'lokallo:content'

function merge(overrides: City[]): City[] {
  const byId = new Map(bundledCities.map((c) => [c.id, c]))
  for (const c of overrides) byId.set(c.id, c)
  return [...byId.values()]
}

function readLocal(): City[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** Sinkrono učitavanje za prvi prikaz (ugrađeno + lokalne izmjene). */
export function loadInitialCities(): City[] {
  return merge(readLocal())
}

const localRepo: ContentRepo = {
  kind: 'local',
  load: async () => loadInitialCities(),
  save: async (city) => {
    const list = readLocal().filter((c) => c.id !== city.id)
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...list, city]))
  },
  remove: async (cityId) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(readLocal().filter((c) => c.id !== cityId)))
  },
  editableCities: async () => ['*'],
}

const firestoreRepo = (fs: NonNullable<typeof db>): ContentRepo => ({
  kind: 'firestore',
  load: async () => {
    const snap = await getDocs(collection(fs, 'cities'))
    return merge(snap.docs.map((d) => JSON.parse(d.data().json) as City))
  },
  save: async (city, editorUid) => {
    await setDoc(doc(fs, 'cities', city.id), { json: JSON.stringify(city), updatedAt: serverTimestamp(), updatedBy: editorUid ?? null })
  },
  remove: async (cityId) => {
    await deleteDoc(doc(fs, 'cities', cityId))
  },
  editableCities: async (uid) => {
    const snap = await getDoc(doc(fs, 'editors', uid))
    return snap.exists() ? ((snap.data().cities as string[]) ?? []) : null
  },
})

export const contentRepo: ContentRepo = db ? firestoreRepo(db) : localRepo
