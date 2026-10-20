import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { contentRepo, mergeIndex } from '../content/repository'
import { loadBundledCity } from '.'
import type { City, CityInfo } from './types'

const SELECTED_KEY = 'lokallo:city'
const INDEX_KEY = 'lokallo:index'
const cacheKey = (id: string) => `lokallo:city-data:${id}`

interface CityValue {
  city: City
  /** Popis svih gradova (samo sažeci, bez sadržaja) */
  cities: CityInfo[]
  setCity: (id: string) => void
}

const CityContext = createContext<CityValue | null>(null)

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  } catch {
    // pohrana nije dostupna ili je puna – radi i bez kopije
  }
}

interface CachedCity {
  version: number
  city: City
}

/**
 * Učitava popis gradova i sadržaj SAMO odabranog grada. Objavljeni grad sprema se na uređaj
 * s verzijom i ponovno preuzima tek kad se verzija u popisu promijeni, pa je uobičajeno
 * otvaranje aplikacije jedno malo čitanje (popis). Ugrađeni grad dolazi iz zasebnog dijela koda.
 */
export function CityProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [index, setIndex] = useState<CityInfo[]>(() => read<CityInfo[]>(INDEX_KEY) ?? mergeIndex([]))
  const [selectedId, setSelectedId] = useState(() => {
    try {
      return localStorage.getItem(SELECTED_KEY)
    } catch {
      return null
    }
  })
  const info = index.find((c) => c.id === selectedId) ?? index[0]
  const [city, setCityData] = useState<City | null>(() => read<CachedCity>(cacheKey(info.id))?.city ?? null)

  useEffect(() => {
    contentRepo
      .loadIndex()
      .then((fresh) => {
        setIndex(fresh)
        write(INDEX_KEY, fresh)
      })
      .catch((e) => console.warn('Popis gradova nije dostupan, koristi se spremljeni.', e))
  }, [])

  useEffect(() => {
    let cancelled = false
    const cached = read<CachedCity>(cacheKey(info.id))
    const fresh = !!info.version && cached?.version === info.version
    // Svježa kopija na uređaju → bez preuzimanja. Neobjavljen grad (bez verzije) je samo
    // ugrađeni sadržaj → bez čitanja iz baze.
    const load = fresh
      ? Promise.resolve(cached.city)
      : info.version || contentRepo.kind === 'local'
        ? contentRepo.loadCity(info.id)
        : loadBundledCity(info.id)
    Promise.resolve(load)
      .then((c) => {
        if (cancelled || !c) return
        setCityData(c)
        if (info.version && !fresh) write(cacheKey(info.id), { version: info.version, city: c } satisfies CachedCity)
      })
      .catch((e) => console.warn(`Grad ${info.id} nije dostupan.`, e))
    return () => {
      cancelled = true
    }
  }, [info.id, info.version])

  const setCity = (id: string) => {
    setSelectedId(id)
    write(SELECTED_KEY, id)
  }

  // Dok se odabrani grad ne učita, prikazuje se prethodni (bez treptanja) ili zamjenski ekran.
  if (!city) return <>{fallback}</>
  return <CityContext.Provider value={{ city, cities: index, setCity }}>{children}</CityContext.Provider>
}

export function useCity() {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity mora biti unutar CityProvider')
  return ctx
}
