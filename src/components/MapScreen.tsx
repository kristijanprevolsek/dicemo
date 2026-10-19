import { useCallback, useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { Circle, CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { landmarks, RIJEKA_CENTER, type Landmark } from '../data/landmarks'
import { useAuth } from '../auth/AuthContext'
import { useLocation } from '../hooks/useLocation'
import { useProximity } from '../hooks/useProximity'
import { distanceMeters, formatDistance, type Position } from '../lib/geo'
import { loadVisited, saveVisited } from '../lib/storage'
import { NearbyToast } from './NearbyToast'
import { StoryPanel } from './StoryPanel'

const iconCache = new Map<string, L.DivIcon>()
function landmarkIcon(l: Landmark, visited: boolean, selected: boolean) {
  const key = `${l.category}-${visited}-${selected}`
  let icon = iconCache.get(key)
  if (!icon) {
    icon = L.divIcon({
      className: '',
      html: `<div class="pin pin-${l.category}${visited ? ' pin-visited' : ''}${selected ? ' pin-selected' : ''}"></div>`,
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

export function MapScreen() {
  const { user, signOut } = useAuth()
  const [simulate, setSimulate] = useState(false)
  const [simPosition, setSimPosition] = useState<Position | null>(null)
  const { position: gpsPosition, status } = useLocation(!simulate)
  const position = simulate ? simPosition : gpsPosition

  const [visited, setVisited] = useState(() => loadVisited(user!.uid))
  // Ulazak u radijus znači da je korisnik bio tamo.
  const markVisited = useCallback(
    (l: Landmark) => setVisited((prev) => (prev.has(l.id) ? prev : new Set(prev).add(l.id))),
    [],
  )
  const { nearby, dismiss } = useProximity(position, landmarks, markVisited)
  const [selected, setSelected] = useState<Landmark | null>(null)
  const [showList, setShowList] = useState(false)
  const [flyTarget, setFlyTarget] = useState<Position | null>(null)

  useEffect(() => saveVisited(user!.uid, visited), [user, visited])

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
        {landmarks.map((l) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={landmarkIcon(l, visited.has(l.id), selected?.id === l.id)}
            eventHandlers={{ click: () => open(l) }}
          />
        ))}
        {position && (
          <>
            {!!position.accuracy && position.accuracy < 200 && (
              <Circle center={[position.lat, position.lng]} radius={position.accuracy} pathOptions={{ className: 'accuracy' }} />
            )}
            <CircleMarker center={[position.lat, position.lng]} radius={8} pathOptions={{ className: 'me' }} />
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

      {nearby && !selected && (
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
