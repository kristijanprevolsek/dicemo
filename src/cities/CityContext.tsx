import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { contentRepo, loadInitialCities } from '../content/repository'
import type { City } from './types'

const STORAGE_KEY = 'dicemo:city'

interface CityValue {
  city: City
  cities: City[]
  setCity: (id: string) => void
}

const CityContext = createContext<CityValue | null>(null)

function readSelected() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState(loadInitialCities)
  const [selectedId, setSelectedId] = useState(readSelected)

  // Svjež sadržaj iz baze; do tada (ili ako baza nije dostupna) vrijedi ugrađeni.
  useEffect(() => {
    if (contentRepo.kind !== 'firestore') return
    contentRepo
      .load()
      .then(setCities)
      .catch((e) => console.warn('Sadržaj iz baze nije dostupan, koristi se ugrađeni.', e))
  }, [])

  const city = cities.find((c) => c.id === selectedId) ?? cities[0]

  const setCity = (id: string) => {
    setSelectedId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // pohrana nije dostupna – izbor vrijedi samo za ovu sesiju
    }
  }

  return <CityContext.Provider value={{ city, cities, setCity }}>{children}</CityContext.Provider>
}

export function useCity() {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity mora biti unutar CityProvider')
  return ctx
}
