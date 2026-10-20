import { bundledCatalog, loadBundledCity } from '../cities'
import { infoOf, type City, type CityInfo } from '../cities/types'
import { getFirestoreSdk, hasFirestore } from '../lib/firebase'

/**
 * Izvor sadržaja gradova. Aplikacija pri otvaranju čita samo popis gradova (jedan mali
 * dokument), a sadržaj tek za odabrani grad – i to samo kad se promijenio (vidi CityContext).
 *
 * - firestore: `meta/cities` = popis gradova {id: CityInfo} s verzijom; `cities/{id}` s poljem
 *   `json` = cijeli City (Firestore ne podržava ugniježđena polja, a ovako je i izvoz/uvoz
 *   trivijalan). Uređuju urednici iz `editors/{uid}`, vidi firestore.rules.
 * - local (demo, bez Firebasea): izmjene se spremaju u localStorage ovog preglednika.
 * U oba slučaja objavljeni sadržaj nadjačava ugrađeni (src/cities) po id-u grada.
 */
export interface ContentRepo {
  kind: 'firestore' | 'local'
  loadIndex(): Promise<CityInfo[]>
  /** Cijeli sadržaj grada; null ako grad ne postoji. */
  loadCity(id: string): Promise<City | null>
  save(city: City, editorUid?: string): Promise<void>
  remove(cityId: string): Promise<void>
  /** Gradovi koje korisnik smije uređivati ('*' = svi); null = nije urednik. */
  editableCities(uid: string): Promise<string[] | null>
}

/** Ugrađeni popis nadjačan objavljenim sažecima. */
export function mergeIndex(published: CityInfo[]): CityInfo[] {
  const byId = new Map(bundledCatalog.map((c) => [c.info.id, c.info]))
  for (const info of published) byId.set(info.id, info)
  return [...byId.values()]
}

/** Svi gradovi s cijelim sadržajem – samo za admin (provjera jedinstvenosti id-eva). */
export async function loadAllCities(repo: ContentRepo): Promise<City[]> {
  const index = await repo.loadIndex()
  const cities = await Promise.all(index.map((c) => repo.loadCity(c.id)))
  return cities.filter((c): c is City => c !== null)
}

const LOCAL_KEY = 'lokallo:content'

function readLocal(): City[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}

const localRepo: ContentRepo = {
  kind: 'local',
  loadIndex: async () => mergeIndex(readLocal().map((c) => infoOf(c))),
  loadCity: async (id) => readLocal().find((c) => c.id === id) ?? (await loadBundledCity(id)) ?? null,
  save: async (city) => {
    const list = readLocal().filter((c) => c.id !== city.id)
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...list, city]))
  },
  remove: async (cityId) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(readLocal().filter((c) => c.id !== cityId)))
  },
  editableCities: async () => ['*'],
}

const firestoreRepo: ContentRepo = {
  kind: 'firestore',
  loadIndex: async () => {
    const { fs, sdk } = await getFirestoreSdk()
    const snap = await sdk.getDoc(sdk.doc(fs, 'meta', 'cities'))
    return mergeIndex(Object.values((snap.data() ?? {}) as Record<string, CityInfo>))
  },
  loadCity: async (id) => {
    const { fs, sdk } = await getFirestoreSdk()
    const snap = await sdk.getDoc(sdk.doc(fs, 'cities', id))
    if (snap.exists()) return JSON.parse(snap.data().json) as City
    return (await loadBundledCity(id)) ?? null
  },
  save: async (city, editorUid) => {
    const { fs, sdk } = await getFirestoreSdk()
    // Sadržaj i sažetak u istoj transakciji, s novom verzijom da aplikacije osvježe kopiju.
    const batch = sdk.writeBatch(fs)
    batch.set(sdk.doc(fs, 'cities', city.id), { json: JSON.stringify(city), updatedAt: sdk.serverTimestamp(), updatedBy: editorUid ?? null })
    batch.set(sdk.doc(fs, 'meta', 'cities'), { [city.id]: infoOf(city, Date.now()) }, { merge: true })
    await batch.commit()
  },
  remove: async (cityId) => {
    const { fs, sdk } = await getFirestoreSdk()
    const batch = sdk.writeBatch(fs)
    batch.delete(sdk.doc(fs, 'cities', cityId))
    batch.set(sdk.doc(fs, 'meta', 'cities'), { [cityId]: sdk.deleteField() }, { merge: true })
    await batch.commit()
  },
  editableCities: async (uid) => {
    const { fs, sdk } = await getFirestoreSdk()
    const snap = await sdk.getDoc(sdk.doc(fs, 'editors', uid))
    return snap.exists() ? ((snap.data().cities as string[]) ?? []) : null
  },
}

export const contentRepo: ContentRepo = hasFirestore ? firestoreRepo : localRepo
