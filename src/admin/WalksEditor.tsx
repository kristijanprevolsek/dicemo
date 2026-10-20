import { useState } from 'react'
import type { City, Walk, WalkStop } from '../cities/types'
import { LocationMap } from './LocationMap'
import { slugify, uniqueId } from './util'

interface Props {
  city: City
  onChange: (fn: (c: City) => City) => void
}

export function WalksEditor({ city, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(city.walks[0]?.id ?? null)
  const [newTitle, setNewTitle] = useState('')
  const walk = city.walks.find((w) => w.id === selectedId) ?? null
  const byId = new Map(city.landmarks.map((l) => [l.id, l]))

  const patch = (changes: Partial<Walk>) =>
    onChange((c) => ({ ...c, walks: c.walks.map((w) => (w.id === selectedId ? { ...w, ...changes } : w)) }))
  const setStops = (stops: WalkStop[]) => patch({ stops })

  const add = () => {
    const title = newTitle.trim()
    if (!title) return
    const id = uniqueId(`${city.id}-${slugify(title)}`, city.walks.map((w) => w.id))
    onChange((c) => ({ ...c, walks: [...c.walks, { id, title, durationMin: 60, description: '', stops: [] }] }))
    setSelectedId(id)
    setNewTitle('')
  }

  const move = (i: number, dir: -1 | 1) => {
    if (!walk) return
    const stops = [...walk.stops]
    ;[stops[i], stops[i + dir]] = [stops[i + dir], stops[i]]
    setStops(stops)
  }

  const route = walk?.stops.map((s) => byId.get(s.landmarkId)).filter(Boolean).map((l) => [l!.lat, l!.lng] as [number, number])

  return (
    <div className="admin-split">
      <aside className="admin-list">
        <form
          className="admin-add"
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <input placeholder="Naziv nove šetnje" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <button className="btn btn-primary btn-small" disabled={!newTitle.trim()}>Dodaj</button>
        </form>
        <ul>
          {city.walks.map((w) => (
            <li key={w.id}>
              <button className={w.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(w.id)}>
                🚶 {w.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {walk ? (
        <section className="admin-form">
          <div className="admin-row">
            <label className="grow">
              Naziv
              <input value={walk.title} onChange={(e) => patch({ title: e.target.value })} />
            </label>
            <label>
              Trajanje (min)
              <input type="number" min={10} step={5} value={walk.durationMin} onChange={(e) => patch({ durationMin: Number(e.target.value) })} />
            </label>
          </div>
          <label>
            Opis
            <textarea rows={3} value={walk.description} onChange={(e) => patch({ description: e.target.value })} />
          </label>

          <fieldset>
            <legend>Točke šetnje (redom)</legend>
            <ol className="admin-stops">
              {walk.stops.map((s, i) => (
                <li key={`${s.landmarkId}-${i}`}>
                  <div className="admin-row">
                    <strong className="grow">{byId.get(s.landmarkId)?.name ?? `⚠ ${s.landmarkId}`}</strong>
                    <button className="icon-btn icon-btn-small" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Gore">↑</button>
                    <button className="icon-btn icon-btn-small" disabled={i === walk.stops.length - 1} onClick={() => move(i, 1)} aria-label="Dolje">↓</button>
                    <button className="icon-btn icon-btn-small" onClick={() => setStops(walk.stops.filter((_, j) => j !== i))} aria-label="Ukloni">✕</button>
                  </div>
                  <input
                    placeholder="Uputa kako doći do ove točke (npr. „Prođi ispod tornja…“)"
                    value={s.hint ?? ''}
                    onChange={(e) => setStops(walk.stops.map((x, j) => (j === i ? { ...x, hint: e.target.value } : x)))}
                  />
                </li>
              ))}
            </ol>
            <select
              value=""
              onChange={(e) => e.target.value && setStops([...walk.stops, { landmarkId: e.target.value, hint: '' }])}
            >
              <option value="">+ Dodaj točku…</option>
              {city.landmarks
                .filter((l) => !walk.stops.some((s) => s.landmarkId === l.id))
                .map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
            </select>
          </fieldset>

          <div className="admin-row">
            <span className="hint grow">Linija na karti je ravna; u aplikaciji se crta pješačka ruta po ulicama.</span>
            <button
              className="btn btn-danger btn-small"
              onClick={() => {
                if (!confirm(`Obrisati šetnju „${walk.title}“?`)) return
                onChange((c) => ({ ...c, walks: c.walks.filter((w) => w.id !== walk.id) }))
                setSelectedId(null)
              }}
            >
              Obriši šetnju
            </button>
          </div>
        </section>
      ) : (
        <section className="admin-form admin-empty">Odaberi ili dodaj šetnju.</section>
      )}

      <LocationMap center={city.center} zoom={city.zoom} landmarks={city.landmarks} route={route} />
    </div>
  )
}
