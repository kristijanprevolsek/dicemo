import { createContext, useContext, useState, type ReactNode } from 'react'
import { getCity } from '.'
import type { City } from './types'

const STORAGE_KEY = 'dicemo:city'

interface CityValue {
  city: City
  setCity: (id: string) => void
}

const CityContext = createContext<CityValue | null>(null)

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState(() => {
    try {
      return getCity(localStorage.getItem(STORAGE_KEY))
    } catch {
      return getCity(null)
    }
  })

  const setCity = (id: string) => {
    setCityState(getCity(id))
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // pohrana nije dostupna – izbor vrijedi samo za ovu sesiju
    }
  }

  return <CityContext.Provider value={{ city, setCity }}>{children}</CityContext.Provider>
}

export function useCity() {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity mora biti unutar CityProvider')
  return ctx
}
