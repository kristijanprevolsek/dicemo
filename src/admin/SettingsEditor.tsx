import type { City, CityBadge } from '../cities/types'
import { LocationMap } from './LocationMap'
import { uniqueId } from './util'

interface Props {
  city: City
  onChange: (fn: (c: City) => City) => void
}

export function SettingsEditor({ city, onChange }: Props) {
  const patch = (changes: Partial<City>) => onChange((c) => ({ ...c, ...changes }))
  const patchBadge = (id: string, changes: Partial<CityBadge>) =>
    onChange((c) => ({ ...c, badges: c.badges.map((b) => (b.id === id ? { ...b, ...changes } : b)) }))

  return (
    <div className="admin-split admin-split-2">
      <section className="admin-form">
        <fieldset>
          <legend>Grad</legend>
          <div className="admin-row">
            <label className="grow">
              Ime
              <input value={city.name} onChange={(e) => patch({ name: e.target.value })} />
            </label>
            <label className="grow">
              „Čini se da si …“
              <input value={city.inName} placeholder="u Rijeci" onChange={(e) => patch({ inName: e.target.value })} />
            </label>
          </div>
          <p className="hint">Središte karte: klikni na kartu desno. Zoom: {city.zoom}</p>
          <input type="range" min={12} max={18} value={city.zoom} onChange={(e) => patch({ zoom: Number(e.target.value) })} />
        </fieldset>

        <fieldset>
          <legend>Nagrada</legend>
          <div className="admin-row">
            <label className="grow">
              Opis nagrade
              <input value={city.reward.title} onChange={(e) => patch({ reward: { ...city.reward, title: e.target.value } })} />
            </label>
            <label>
              Potrebno pečata
              <input
                type="number"
                min={1}
                value={city.reward.stamps}
                onChange={(e) => patch({ reward: { ...city.reward, stamps: Number(e.target.value) } })}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Značke grada</legend>
          <p className="hint">Opće značke (Prvi pečat, Znalac, Šetač, Vodič) postoje automatski.</p>
          {city.badges.map((b) => (
            <div key={b.id} className="admin-badge">
              <div className="admin-row">
                <label className="icon-input">
                  Ikona
                  <input value={b.icon} onChange={(e) => patchBadge(b.id, { icon: e.target.value })} />
                </label>
                <label className="grow">
                  Naziv
                  <input value={b.title} onChange={(e) => patchBadge(b.id, { title: e.target.value })} />
                </label>
                <button
                  className="icon-btn icon-btn-small"
                  aria-label="Obriši značku"
                  onClick={() => onChange((c) => ({ ...c, badges: c.badges.filter((x) => x.id !== b.id) }))}
                >
                  ✕
                </button>
              </div>
              <label>
                Opis
                <input value={b.description} onChange={(e) => patchBadge(b.id, { description: e.target.value })} />
              </label>
              <div className="admin-checks">
                {city.landmarks.map((l) => (
                  <label key={l.id}>
                    <input
                      type="checkbox"
                      checked={b.landmarkIds.includes(l.id)}
                      onChange={(e) =>
                        patchBadge(b.id, {
                          landmarkIds: e.target.checked ? [...b.landmarkIds, l.id] : b.landmarkIds.filter((x) => x !== l.id),
                        })
                      }
                    />
                    {l.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            className="btn btn-secondary btn-small"
            onClick={() =>
              onChange((c) => ({
                ...c,
                badges: [
                  ...c.badges,
                  { id: uniqueId(`${c.id}-znacka`, c.badges.map((x) => x.id)), icon: '⭐', title: 'Nova značka', description: '', landmarkIds: [] },
                ],
              }))
            }
          >
            + Dodaj značku
          </button>
        </fieldset>
      </section>

      <LocationMap
        center={city.center}
        zoom={city.zoom}
        landmarks={city.landmarks}
        showCenter
        onPick={(lat, lng) => patch({ center: [+lat.toFixed(5), +lng.toFixed(5)] })}
      />
    </div>
  )
}
