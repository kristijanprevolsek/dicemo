import { useCallback, useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { Circle, CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { landmarks, RIJEKA_CENTER, type Landmark } from '../data/landmarks'
import { useAuth } from '../auth/AuthContext'
import { useLocation } from '../hooks/useLocation'
import { useProximity } from '../hooks/useProximity'
import { useWalkRoute } from '../hooks/useWalkRoute'
import type { Walk } from '../data/walks'
import { distanceMeters, formatDistance, type Position } from '../lib/geo'
import { useProgress } from '../progress/ProgressContext'
import { NearbyToast } from './NearbyToast'
import { StoryPanel } from './StoryPanel'
import { WalkBanner } from './WalkBanner'

const iconCache = new Map<string, L.DivIcon>()
function landmarkIcon(l: Landmark, visited: boolean, selected: boolean, walkNumber?: number, dim = false) {
  const key = `${l.category}-${visited}-${selected}-${walkNumber}-${dim}`
  let icon = iconCache.get(key)
  if (!icon) {
    const cls = ['pin', `pin-${l.category}`, visited && 'pin-visited', selected && 'pin-selected', dim && 'pin-dim']
    icon = L.divIcon({
      className: '',
      html: `<div class="${cls.filter(Boolean).join(' ')}">${walkNumber ? `<span>${walkNumber}</span>` : ''}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })
    iconCache.set(key, icon)
  }
  return icon
}

function SimulateClicks({ onPick }: { onPick: (p: Position) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

function FlyTo({ target }: { target: Position | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.6 })
  }, [target, map])
  return null
}

function FitRoute({ walkId, coords }: { walkId: string; coords: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length) map.fitBounds(coords, { paddingTopLeft: [40, 320], paddingBottomRight: [70, 40] })
    // samo pri pokretanju šetnje, ne pri svakom osvježenju rute
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkId, map])
  return null
}

const landmarkById = new Map(landmarks.map((l) => [l.id, l]))

interface Props {
  walk: Walk | null
  onEndWalk: () => void
}

export function MapScreen({ walk, onEndWalk }: Props) {
  const { user, signOut } = useAuth()
  const [simulate, setSimulate] = useState(false)
  const [simPosition, setSimPosition] = useState<Position | null>(null)
  const { position: gpsPosition, status } = useLocation(!simulate)
  const position = simulate ? simPosition : gpsPosition

  const { progress, markVisited, completeWalk } = useProgress()
  const visited = useMemo(() => new Set(progress.visited), [progress.visited])
  // Ulazak u radijus znači da je korisnik bio tamo.
  const [selected, setSelected] = useState<Landmark | null>(null)
  // Napredak po šetnji: id šetnje → id-evi dosegnutih točaka
  const [reachedByWalk, setReachedByWalk] = useState<Record<string, string[]>>({})
  const reached = walk ? (reachedByWalk[walk.id] ?? []) : []
  const targetStop = walk?.stops.find((s) => !reached.includes(s.landmarkId))
  const target = targetStop ? landmarkById.get(targetStop.landmarkId)! : null

  const markReached = useCallback(
    (id: string) => {
      if (!walk) return
      const list = reachedByWalk[walk.id] ?? []
      if (list.includes(id)) return
      const next = [...list, id]
      setReachedByWalk((prev) => ({ ...prev, [walk.id]: next }))
      if (walk.stops.every((s) => next.includes(s.landmarkId))) completeWalk(walk.id)
    },
    [walk, reachedByWalk, completeWalk],
  )

  const onEnter = useCallback(
    (l: Landmark) => {
      markVisited(l.id)
      // Na točki šetnje odmah otvori priču.
      if (walk?.stops.some((s) => s.landmarkId === l.id)) {
        markReached(l.id)
        setSelected(l)
      }
    },
    [walk, markReached, markVisited],
  )
  const { nearby, dismiss } = useProximity(position, landmarks, onEnter)

  const walkPoints = useMemo(() => (walk ? walk.stops.map((s) => landmarkById.get(s.landmarkId)!) : []), [walk])
  const route = useWalkRoute(walkPoints)

  const endWalk = () => {
    if (walk) setReachedByWalk((prev) => ({ ...prev, [walk.id]: [] }))
    onEndWalk()
  }
  const [showList, setShowList] = useState(false)
  const [flyTarget, setFlyTarget] = useState<Position | null>(null)

  const open = (l: Landmark) => {
    setSelected(l)
    setShowList(false)
    setFlyTarget({ lat: l.lat, lng: l.lng })
  }

  const sorted = useMemo(() => {
    if (!position) return landmarks
    return [...landmarks].sort((a, b) => distanceMeters(position, a) - distanceMeters(position, b))
  }, [position])

  const statusText = simulate
    ? 'Simulacija: dodirni kartu za pomicanje'
    : { waiting: 'Tražim lokaciju…', tracking: 'Lokacija aktivna', denied: 'Pristup lokaciji odbijen', unavailable: 'Lokacija nedostupna' }[status]

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1 className="brand brand-small">Dićemo</h1>
          <p className="muted small">
            {visited.size}/{landmarks.length} otkriveno · {statusText}
          </p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-small" onClick={() => setShowList((v) => !v)}>
            {showList ? 'Karta' : 'Popis'}
          </button>
          <button className="btn btn-secondary btn-small" onClick={signOut} title={`Prijavljen kao ${user?.name}`}>Odjava</button>
        </div>
      </header>

      <MapContainer center={RIJEKA_CENTER} zoom={15} className="map" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {route && <Polyline positions={route.coords} pathOptions={{ color: '#0b5f8a', weight: 5, opacity: 0.75, dashArray: route.routed ? undefined : '8 10' }} />}
        {walk && route && <FitRoute walkId={walk.id} coords={route.coords} />}
        {landmarks.map((l) => {
          const stopIndex = walk ? walk.stops.findIndex((s) => s.landmarkId === l.id) : -1
          return (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            zIndexOffset={stopIndex >= 0 ? 1000 : 0}
            icon={landmarkIcon(
              l,
              visited.has(l.id),
              selected?.id === l.id || target?.id === l.id,
              stopIndex >= 0 ? stopIndex + 1 : undefined,
              !!walk && stopIndex < 0,
            )}
            eventHandlers={{ click: () => open(l) }}
          />
          )
        })}
        {position && (
          <>
            {!!position.accuracy && position.accuracy < 200 && (
              <Circle center={[position.lat, position.lng]} radius={position.accuracy} pathOptions={{ color: '#1a73e8', weight: 1, opacity: 0.3, fillOpacity: 0.12 }} />
            )}
            <CircleMarker center={[position.lat, position.lng]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#1a73e8', fillOpacity: 1 }} />
          </>
        )}
        {simulate && <SimulateClicks onPick={setSimPosition} />}
        <FlyTo target={flyTarget} />
      </MapContainer>

      <div className="fab-stack">
        <button
          className={`fab${simulate ? ' fab-active' : ''}`}
          onClick={() => setSimulate((s) => !s)}
          title="Simuliraj šetnju (za testiranje)"
        >
          🚶
        </button>
        {position && (
          <button className="fab" onClick={() => setFlyTarget({ ...position })} title="Moja lokacija">◎</button>
        )}
      </div>

      {walk && !selected && !showList && (
        <WalkBanner
          walk={walk}
          reachedCount={reached.length}
          target={target}
          hint={targetStop?.hint}
          distance={position && target ? distanceMeters(position, target) : null}
          routed={route?.routed ?? true}
          onStory={() => target && open(target)}
          onNext={() => target && markReached(target.id)}
          onEnd={endWalk}
        />
      )}

      {nearby && !selected && !walk && (
        <NearbyToast
          landmark={nearby}
          onOpen={() => {
            open(nearby)
            dismiss()
          }}
          onDismiss={dismiss}
        />
      )}

      {showList && (
        <section className="sheet sheet-list">
          <div className="sheet-handle" />
          <h2>Znamenitosti Rijeke</h2>
          <ul className="list">
            {sorted.map((l) => (
              <li key={l.id}>
                <button onClick={() => open(l)}>
                  <span className={`dot dot-${l.category}`} />
                  <span className="list-text">
                    <strong>{l.name}</strong>
                    <span className="muted small">{l.summary}</span>
                  </span>
                  <span className="muted small">
                    {visited.has(l.id) ? '✓' : position ? formatDistance(distanceMeters(position, l)) : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selected && (
        <StoryPanel
          landmark={selected}
          distance={position ? distanceMeters(position, selected) : null}
          visited={visited.has(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
