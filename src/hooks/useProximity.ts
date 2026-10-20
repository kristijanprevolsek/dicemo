import { useEffect, useRef, useState } from 'react'
import type { Landmark } from '../cities/types'
import { distanceMeters, type Position } from '../lib/geo'

/**
 * Vraća znamenitost u čijem se radijusu korisnik upravo našao. Svaka znamenitost
 * okida najviše jednom po sesiji, a ponovno tek kad korisnik izađe iz radijusa i vrati se.
 */
export function useProximity(
  position: Position | null,
  landmarks: Landmark[],
  onEnter?: (landmark: Landmark) => void,
) {
  const [nearby, setNearby] = useState<Landmark | null>(null)
  const inside = useRef(new Set<string>())
  const announced = useRef(new Set<string>())

  useEffect(() => {
    if (!position) return
    let closest: { landmark: Landmark; d: number } | null = null

    for (const l of landmarks) {
      const d = distanceMeters(position, l)
      if (d <= l.radius) {
        if (!closest || d < closest.d) closest = { landmark: l, d }
      } else if (d > l.radius * 1.5) {
        // histereza – izbjegava treperenje na rubu radijusa zbog GPS šuma
        inside.current.delete(l.id)
      }
    }

    if (closest && !inside.current.has(closest.landmark.id)) {
      inside.current.add(closest.landmark.id)
      onEnter?.(closest.landmark)
      if (!announced.current.has(closest.landmark.id)) {
        announced.current.add(closest.landmark.id)
        setNearby(closest.landmark)
        navigator.vibrate?.(200)
      }
    }
  }, [position, landmarks, onEnter])

  return { nearby, dismiss: () => setNearby(null) }
}
