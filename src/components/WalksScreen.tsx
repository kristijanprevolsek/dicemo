import { landmarks } from '../data/landmarks'
import { walks, type Walk } from '../data/walks'
import { distanceMeters, formatDistance } from '../lib/geo'

const byId = new Map(landmarks.map((l) => [l.id, l]))

/** Gruba procjena duljine: zračna udaljenost × 1,3 za ulice i zavoje. */
function approxLength(walk: Walk) {
  const pts = walk.stops.map((s) => byId.get(s.landmarkId)!)
  let m = 0
  for (let i = 1; i < pts.length; i++) m += distanceMeters(pts[i - 1], pts[i])
  return m * 1.3
}

export function WalksScreen({ onStart }: { onStart: (walk: Walk) => void }) {
  return (
    <div className="screen">
      <header className="screen-header">
        <h1 className="brand brand-small">Šetnje</h1>
        <p className="muted small">Tematske rute kroz Rijeku – aplikacija te vodi od točke do točke.</p>
      </header>
      <div className="screen-body">
        {walks.map((w) => (
          <article key={w.id} className="walk-card">
            <h2>{w.title}</h2>
            <p className="muted small">
              {w.durationMin} min · ≈ {formatDistance(approxLength(w))} · {w.stops.length} točaka
            </p>
            <p>{w.description}</p>
            <ol className="walk-stops">
              {w.stops.map((s) => (
                <li key={s.landmarkId}>{byId.get(s.landmarkId)?.name}</li>
              ))}
            </ol>
            <button className="btn btn-primary" onClick={() => onStart(w)}>Kreni u šetnju</button>
          </article>
        ))}
      </div>
    </div>
  )
}
