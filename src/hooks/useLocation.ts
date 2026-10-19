import { useEffect, useState } from 'react'
import { Geolocation } from '@capacitor/geolocation'
import type { Position } from '../lib/geo'

export type LocationStatus = 'waiting' | 'tracking' | 'denied' | 'unavailable'

/**
 * Prati lokaciju korisnika. Capacitor Geolocation na webu koristi navigator.geolocation,
 * a u nativnoj aplikaciji GPS uređaja – isti kod radi na sve tri platforme.
 */
export function useLocation(enabled: boolean) {
  const [position, setPosition] = useState<Position | null>(null)
  const [status, setStatus] = useState<LocationStatus>('waiting')

  useEffect(() => {
    if (!enabled) return
    let watchId: string | undefined
    let cancelled = false

    Geolocation.watchPosition({ enableHighAccuracy: true, maximumAge: 5000 }, (pos, err) => {
      if (cancelled) return
      if (err || !pos) {
        const denied = err?.code === 1 || /denied|permission/i.test(String(err?.message))
        setStatus(denied ? 'denied' : 'unavailable')
        return
      }
      setStatus('tracking')
      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy })
    })
      .then((id) => {
        if (cancelled) Geolocation.clearWatch({ id })
        else watchId = id
      })
      .catch(() => setStatus('unavailable'))

    return () => {
      cancelled = true
      if (watchId) Geolocation.clearWatch({ id: watchId })
    }
  }, [enabled])

  return { position, status }
}
