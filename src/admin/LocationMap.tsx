import { useEffect } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Landmark } from '../cities/types'

interface Props {
  center: [number, number]
  zoom: number
  landmarks: Landmark[]
  /** Odabrana znamenitost – može se povući ili postaviti klikom na kartu */
  selectedId?: string | null
  onSelect?: (id: string) => void
  /** Klik na kartu ili povlačenje odabrane oznake */
  onPick?: (lat: number, lng: number) => void
  route?: [number, number][]
  /** Prikaži križić središta grada (postavke grada) */
  showCenter?: boolean
}

const pin = (l: Landmark, selected: boolean, label?: number) =>
  L.divIcon({
    className: '',
    html: `<div class="pin pin-${l.category}${selected ? ' pin-selected' : ''}">${label ? `<span>${label}</span>` : ''}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })

const centerIcon = L.divIcon({ className: '', html: '<div class="admin-center">+</div>', iconSize: [30, 30], iconAnchor: [15, 15] })

function Clicks({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

/** Prati promjenu grada/odabira i pomakne kartu. */
function Follow({ target, zoom }: { target: [number, number]; zoom: number }) {
  const map = useMap()
  const [lat, lng] = target
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), zoom - 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, map])
  return null
}

export function LocationMap({ center, zoom, landmarks, selectedId, onSelect, onPick, route, showCenter }: Props) {
  const selected = landmarks.find((l) => l.id === selectedId)

  return (
    <MapContainer center={center} zoom={zoom} className="admin-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Follow target={selected ? [selected.lat, selected.lng] : center} zoom={zoom} />
      {onPick && <Clicks onPick={onPick} />}
      {route && route.length > 1 && <Polyline positions={route} pathOptions={{ color: '#0b5f8a', weight: 4, dashArray: '8 8' }} />}
      {showCenter && <Marker position={center} icon={centerIcon} />}
      {landmarks.map((l) => {
        const isSel = l.id === selectedId
        const stopNo = route ? route.findIndex(([a, b]) => a === l.lat && b === l.lng) + 1 : 0
        return (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={pin(l, isSel, stopNo || undefined)}
            draggable={isSel && !!onPick}
            zIndexOffset={isSel ? 1000 : 0}
            eventHandlers={{
              click: () => onSelect?.(l.id),
              dragend: (e) => {
                const p = (e.target as L.Marker).getLatLng()
                onPick?.(p.lat, p.lng)
              },
            }}
          />
        )
      })}
      {selected && <Circle center={[selected.lat, selected.lng]} radius={selected.radius} pathOptions={{ color: '#0b5f8a', weight: 1, fillOpacity: 0.1 }} />}
    </MapContainer>
  )
}
