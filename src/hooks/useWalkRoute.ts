import { useEffect, useState } from 'react'
import type { Position } from '../lib/geo'

// Javni OSRM poslužitelj s pješačkim profilom (OSM Njemačka). Za produkciju koristiti
// vlastiti ili komercijalni servis (GraphHopper, Mapbox, OpenRouteService).
const ROUTING_URL = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/'

export interface WalkRoute {
  coords: [number, number][]
  /** false = ravne linije između točaka (servis za rute nedostupan) */
  routed: boolean
}

/** Pješačka ruta kroz zadane točke. Ako servis ne odgovori, vraća ravne linije. */
export function useWalkRoute(points: Position[]): WalkRoute | null {
  const key = points.map((p) => `${p.lng},${p.lat}`).join(';')
  const [route, setRoute] = useState<{ key: string; value: WalkRoute } | null>(null)

  useEffect(() => {
    if (!key) return
    const straight: WalkRoute = {
      coords: key.split(';').map((s) => {
        const [lng, lat] = s.split(',').map(Number)
        return [lat, lng]
      }),
      routed: false,
    }
    const ctrl = new AbortController()
    fetch(`${ROUTING_URL}${key}?overview=full&geometries=geojson`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const line: [number, number][] | undefined = data.routes?.[0]?.geometry?.coordinates
        setRoute({
          key,
          value: line ? { coords: line.map(([lng, lat]) => [lat, lng]), routed: true } : straight,
        })
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setRoute({ key, value: straight })
      })
    return () => ctrl.abort()
  }, [key])

  return route?.key === key ? route.value : null
}
